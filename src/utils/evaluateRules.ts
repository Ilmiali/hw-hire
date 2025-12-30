
import { 
    Rule, 
    RuleCondition, 
    RuleConditionGroup, 
    RuleOperator, 
    FormField 
} from '../types/form-builder';

interface EvaluateResult {
    visibleFieldIds: Set<string>;
    requiredFieldIds: Set<string>;
}

// Helper to get value from values object (handles scaling to nested structures if needed later)
const getValue = (values: Record<string, any>, fieldId: string) => {
    return values[fieldId];
};

const evaluateCondition = (
    condition: RuleCondition, 
    values: Record<string, any>, 
    _fields: FormField[] // kept for potential future use (e.g. checking field type)
): boolean => {
    const fieldValue = getValue(values, condition.fieldId);
    const targetValue = condition.value;

    switch (condition.operator) {
        case 'eq':
            return fieldValue == targetValue; // loose equality for string/number overlap
        case 'neq':
            return fieldValue != targetValue;
        case 'contains':
            if (Array.isArray(fieldValue)) {
                return fieldValue.includes(targetValue);
            }
            return String(fieldValue || '').toLowerCase().includes(String(targetValue || '').toLowerCase());
        case 'in':
             // If targetValue is array (e.g. multi-select target), check if fieldValue is in it
             // Or if fieldValue is array (multi-select), check intersection?
             // Standard "In" usually means "Field ID IN [A, B, C]"
             if (Array.isArray(targetValue)) {
                 return targetValue.includes(fieldValue);
             }
             return false;
        case 'isEmpty':
            return fieldValue === null || fieldValue === undefined || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0);
        case 'isNotEmpty':
            return !(fieldValue === null || fieldValue === undefined || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0));
        case 'gt':
            return Number(fieldValue) > Number(targetValue);
        case 'gte':
            return Number(fieldValue) >= Number(targetValue);
        case 'lt':
            return Number(fieldValue) < Number(targetValue);
        case 'lte':
            return Number(fieldValue) <= Number(targetValue);
        default:
            return false;
    }
};

const evaluateGroup = (
    group: RuleConditionGroup, 
    values: Record<string, any>,
    fields: FormField[]
): boolean => {
    if (!group.conditions || group.conditions.length === 0) return true; // Empty group matches? Or false? usually true if used as "all"

    // If combinator is AND, all must be true
    if (group.combinator === 'and') {
        return group.conditions.every(cond => {
            if ('conditions' in cond) {
                return evaluateGroup(cond, values, fields);
            } else {
                return evaluateCondition(cond, values, fields);
            }
        });
    }

    // If combinator is OR, at least one must be true
    if (group.combinator === 'or') {
        return group.conditions.some(cond => {
            if ('conditions' in cond) {
                return evaluateGroup(cond, values, fields);
            } else {
                return evaluateCondition(cond, values, fields);
            }
        });
    }

    return false;
};

export const evaluateRules = (
    rules: Rule[], 
    values: Record<string, any>,
    fields: FormField[]
): EvaluateResult => {
    // 1. Initialize result sets
    // Default: All fields visible. Requiredness comes from intrinsic field props, modified by rules.
    // However, to implementing "Show" action effectively, we might assume hidden if a show rule exists?
    // User Constraint: "hide overrides show", "optional overrides require".
    // Strategy: 
    // - visible: Start with ALL fields. Collect 'hide' actions. Remove them.
    // - required: Start with Intrinsic required. Collect 'require' and 'optional' actions.
    
    const hiddenFieldIds = new Set<string>();
    const requiredFieldIds = new Set<string>();
    const optionalFieldIds = new Set<string>();

    // Initialize required with intrinsic definition
    fields.forEach(f => {
        if (f.required) requiredFieldIds.add(f.id);
    });

    // 2. Evaluate each rule
    rules.forEach(rule => {
        const isMatch = evaluateGroup(rule.conditions, values, fields);
        
        if (isMatch) {
            rule.actions.forEach(action => {
                switch (action.type) {
                    case 'hide':
                        hiddenFieldIds.add(action.targetFieldId);
                        break;
                    case 'show':
                         // 'show' is implicit if we start with all visible.
                         // BUT validity check: "hide overrides show".
                         // If we track 'hidden', 'show' just acts as a counter-weight ONLY IF 
                         // the default was hidden. Since default is visible, 'show' does nothing 
                         // unless we change our default assumption.
                         // OR: If we have multiple rules, and one hides, one shows... "hide overrides show".
                         // So if ANY rule hides, it's hidden. "Show" is weak.
                         // EXCEPT: What if default is hidden?
                         // Current logic: Default visible. So 'show' action is redundant unless we have logic like:
                         // hidden = (defaultHidden || hiddenByRule) && !shownByRule.
                         // But users usually expect "If A then Hide B".
                         // If users want "If A then Show B", they assume B is hidden otherwise?
                         // Implementing "Hide" priority:
                         // We will treat fields as visible unless explicitly hidden.
                         // "Show" action basically ensures we DON'T hide it? No, that conflicts with "hide overrides show".
                         // So "Show" only works if the field was hidden by default... which no field is.
                         // So "Show" action might be useless in "Default Visible" mode.
                         // BUT, user asked for "Show/Hide" actions.
                         // Use Case: "If X check, show Y". Implies Y is initally hidden?
                         // If user manually sets Y to hidden (via some prop?), then "Show" works.
                         // But we don't have "Hidden initially" prop on fields yet.
                         // Let's assume fields are visible. "Hide" hides them.
                         // If the user wants "Show", they likely mean "Hide by default, show if condition".
                         // Since we don't have "hidden by default", we can only support "Hide if condition".
                         // ALTERNATIVE: "Show" could mean "Undo Hide"? But "Hide overrides Show".
                         // So "Show" is effectively ignored if "Hide" is present.
                         // If "Hide" is NOT present, it's visible anyway.
                         // One interpretation: The presence of a "Show" rule for a field implies it should be hidden otherwise?
                         // No, that's implicit magic.
                         // Let's just track explicit Hides.
                        break;
                    case 'require':
                        requiredFieldIds.add(action.targetFieldId);
                        break;
                    case 'optional':
                        optionalFieldIds.add(action.targetFieldId);
                        break;
                }
            });
        }
    });

    // 3. Compute final sets
    
    // Visible: All fields minus hidden
    // Note: We only output visible IDs.
    const allFieldIds = fields.map(f => f.id);
    const visibleFieldIds = new Set(allFieldIds.filter(id => !hiddenFieldIds.has(id)));

    // Required: Intrinsic + RequiredActions - OptionalActions (Optional overrides Require)
    // Actually Logic: (Intrinsic OR RequiredByRule) AND !OptionalByRule
    const finalRequiredFieldIds = new Set<string>();
    fields.forEach(f => {
        const isIntrinsic = f.required;
        const isForceRequired = requiredFieldIds.has(f.id);
        const isForceOptional = optionalFieldIds.has(f.id);

        if ((isIntrinsic || isForceRequired) && !isForceOptional) {
            finalRequiredFieldIds.add(f.id);
        }
    });

    return {
        visibleFieldIds,
        requiredFieldIds: finalRequiredFieldIds
    };
};
