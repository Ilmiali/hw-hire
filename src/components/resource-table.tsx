import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchResources } from '../store/slices/resourceSlice';
import { User } from '../store/slices/usersSlice';
import { fetchResourceUsers } from '../store/slices/shareSlice';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EllipsisHorizontalIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

interface ResourceTableProps {
  orgId: string;
  moduleId: string;
  resourceType: string;
  onDelete?: (resource: any) => void;
  onRowClick?: (resource: any) => void;
}

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const AccessAvatarGroup = ({
  orgId,
  moduleId,
  resourceType,
  resourceId,
  ownerIds,
}: {
  orgId: string;
  moduleId: string;
  resourceType: string;
  resourceId: string;
  ownerIds: string[];
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    dispatch(
      fetchResourceUsers({ orgId, moduleId, resourceType, resourceId })
    ).unwrap().then((users) => {
        if (mounted) {
            setMembers(users as User[]);
            setLoading(false);
        }
    }).catch(() => {
        if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [dispatch, orgId, moduleId, resourceType, resourceId]);

  if (loading && members.length === 0) return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;

  const displayMembers = members.slice(0, 4);
  const remaining = members.length - 4;

  return (
    <div className="flex -space-x-2">
      <TooltipProvider delayDuration={0}>
      {displayMembers.map((member) => (
        <Tooltip key={member.id}>
           <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background bg-muted cursor-default ring-0">
                    <AvatarImage src={(member as any).avatarUrl} alt={member.fullName || member.name || 'User'} />
                    <AvatarFallback className="text-[10px] font-medium">
                        {getInitials(member.fullName || member.name)}
                    </AvatarFallback>
                </Avatar>
           </TooltipTrigger>
           <TooltipContent>
               <p>{member.fullName || member.name || 'Unknown User'} ({ownerIds.includes(member.id) ? 'Owner' : 'Member'})</p>
           </TooltipContent>
        </Tooltip>
      ))}
      </TooltipProvider>
      {remaining > 0 && (
         <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
            +{remaining}
         </div>
      )}
    </div>
  );
};

export function ResourceTable({ orgId, moduleId, resourceType, onDelete, onRowClick }: ResourceTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { resources, loading: loadingResources } = useSelector((state: RootState) => state.resource);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updatedAt', desc: true }]);
  
  const resourceList = resources[resourceType] || [];

  useEffect(() => {
    dispatch(fetchResources({ orgId, moduleId, resourceType }));
  }, [dispatch, orgId, moduleId, resourceType]);

  const columns: ColumnDef<any>[] = useMemo(() => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4 h-8 data-[state=open]:bg-accent"
            >
              Name
              {column.getIsSorted() === "asc" ? (
                <ChevronUpIcon className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              ) : (
                <ArrowsUpDownIcon className="ml-2 h-4 w-4 opacity-50" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.getValue("status") === 'active' ? 'default' : 'secondary'} className="capitalize">
            {row.getValue("status")}
          </Badge>
        ),
      },
      {
        id: "shared",
        header: "Shared",
        cell: ({ row }) => (
          <AccessAvatarGroup 
            orgId={orgId} 
             moduleId={moduleId} 
             resourceId={row.original.id}
             resourceType={resourceType}
             ownerIds={row.original.ownerIds || []} 
          />
        ),
      },
      {
        accessorKey: "publishedVersionId",
        header: "Published",
        cell: ({ row }) => row.getValue("publishedVersionId") ? 'v1.0' : '-',
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4 h-8 data-[state=open]:bg-accent"
            >
              Last Updated
              {column.getIsSorted() === "asc" ? (
                <ChevronUpIcon className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              ) : (
                <ArrowsUpDownIcon className="ml-2 h-4 w-4 opacity-50" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => {
            const date = row.getValue("updatedAt");
            return <div className="text-muted-foreground text-xs">{date ? new Date(date as string).toLocaleDateString() : '-'}</div>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const resource = row.original;
          const isOwner = currentUser && resource.ownerIds?.includes(currentUser.uid);
          
          if (!isOwner) return null;

          return (
            <div className="flex justify-end p-2 cursor-default" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
                    onClick={() => onDelete?.(resource)}
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
  ], [orgId, moduleId, resourceType, currentUser, onDelete]);


  const table = useReactTable({
    data: resourceList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  // Loading state
  if (loadingResources && resourceList.length === 0) {
     return (
         <div className="rounded-md border p-8 flex justify-center items-center bg-background/50">
            <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading resources...</p>
            </div>
         </div>
     );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => {
                    // Logic to prevent clicking if we are interacting with some control
                    onRowClick?.(row.original);
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
