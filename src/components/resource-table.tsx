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
  getPaginationRowModel,
  PaginationState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  PlusIcon,
  EllipsisHorizontalIcon, 
  TrashIcon, 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ArrowsUpDownIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ClockIcon,
  HandRaisedIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';

interface ResourceTableProps {
  orgId: string;
  moduleId: string;
  resourceType: string;
  onDelete?: (resource: any) => void;
  onRowClick?: (resource: any) => void;
  onCreate?: () => void;
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
}: {
  orgId: string;
  moduleId: string;
  resourceType: string;
  resourceId: string;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [members, setMembers] = useState<{ user: User, resourceRole: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    dispatch(
      fetchResourceUsers({ orgId, moduleId, resourceType, resourceId })
    ).unwrap().then((results) => {
        if (mounted) {
            setMembers(results as { user: User, resourceRole: string }[]);
            setLoading(false);
        }
    }).catch(() => {
        if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [dispatch, orgId, moduleId, resourceType, resourceId]);

  if (loading && members.length === 0) return (
    <div className="flex -space-x-1">
        {[1, 2].map((i) => (
            <Skeleton key={i} className="h-5 w-5 rounded-full border border-background" />
        ))}
    </div>
  );

  const displayMembers = members.slice(0, 4);
  const remaining = members.length - 4;

  return (
    <div className="flex -space-x-1 items-center">
      <TooltipProvider delayDuration={0}>
      {displayMembers.map(({ user, resourceRole }) => (
        <Tooltip key={user.id}>
           <TooltipTrigger asChild>
                <Avatar className="h-5 w-5 border border-background bg-muted cursor-default ring-0">
                    <AvatarImage src={(user as any).avatarUrl} alt={user.fullName || user.name || 'User'} />
                    <AvatarFallback className="text-[8px] font-semibold">
                        {getInitials(user.fullName || user.name)}
                    </AvatarFallback>
                </Avatar>
           </TooltipTrigger>
           <TooltipContent>
               <p className="capitalize text-xs font-medium">{user.fullName || user.name || 'Unknown User'} ({resourceRole})</p>
           </TooltipContent>
        </Tooltip>
      ))}
      </TooltipProvider>
      {remaining > 0 && (
         <div className="flex h-5 w-5 items-center justify-center rounded-full border border-background bg-muted text-[8px] font-semibold text-muted-foreground ml-1">
            +{remaining}
         </div>
      )}
    </div>
  );
};

export function ResourceTable({ orgId, moduleId, resourceType, onDelete, onRowClick, onCreate }: ResourceTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { resources, loading: loadingResources } = useSelector((state: RootState) => state.resource);
  const { user: currentUser, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updatedAt', desc: true }]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  
  const resourceList = resources[resourceType] || [];

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchResources({ orgId, moduleId, resourceType }));
    }
  }, [dispatch, orgId, moduleId, resourceType, currentUser]);

// ... (skipping columns definition for this chunk as it's large)
// I will split this into two calls if necessary, but actually I only need to change the function head and the bottom part.
// Wait, I can use multi_replace_file_content or just two separate calls.
// Let's do function head first.

  const columns: ColumnDef<any>[] = useMemo(() => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4 h-8 text-xs font-semibold text-muted-foreground/70 tracking-tight hover:bg-transparent"
            >
              Title
              {column.getIsSorted() === "asc" ? (
                <ChevronUpIcon className="ml-1 h-3 w-3" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDownIcon className="ml-1 h-3 w-3" />
              ) : (
                <ArrowsUpDownIcon className="ml-1 h-3 w-3 opacity-0" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => (
            <div className="flex flex-col gap-0.5 max-w-[400px]">
                <div className="font-medium text-sm truncate">{row.getValue("name")}</div>
                {row.original.description && (
                   <div className="text-xs text-muted-foreground/60 truncate italic">{row.original.description}</div>
                )}
            </div>
        ),
      },
      {
        accessorKey: "visibility",
        header: "Visibility",
        cell: ({ row }) => {
          const visibility = row.getValue("visibility") as string;
          const isPublic = visibility === 'public';
          return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                {isPublic ? (
                    <GlobeAltIcon className="h-3.5 w-3.5 text-blue-500/80" />
                ) : (
                    <LockClosedIcon className="h-3.5 w-3.5 opacity-60" />
                )}
                <span className="capitalize">{visibility || 'Private'}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            let Icon = CheckCircleIcon;
            let iconColor = "text-green-500/80";
            
            if (status === 'draft') {
                Icon = ClockIcon;
                iconColor = "text-orange-500/80";
            } else if (status === 'archived') {
                Icon = HandRaisedIcon;
                iconColor = "text-red-500/80";
            } else if (status === 'active') {
                Icon = CheckCircleIcon;
                iconColor = "text-green-500/80";
            }

            return (
                <div className="flex items-center gap-1.5 text-xs">
                    <Icon className={cn("h-3.5 w-3.5", iconColor)} />
                    <span className="capitalize text-muted-foreground/80">{status}</span>
                </div>
            );
        },
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
          />
        ),
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4 h-8 text-xs font-semibold text-muted-foreground/70 tracking-tight hover:bg-transparent"
            >
              Updated
              {column.getIsSorted() === "asc" ? (
                <ChevronUpIcon className="ml-1 h-3 w-3" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDownIcon className="ml-1 h-3 w-3" />
              ) : (
                <ArrowsUpDownIcon className="ml-1 h-3 w-3 opacity-0" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => {
            const date = row.getValue("updatedAt");
            return <div className="text-muted-foreground/60 text-xs tracking-tight">{date ? new Date(date as string).toLocaleDateString() : '-'}</div>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const resource = row.original;
          const isOwner = currentUser && resource.ownerIds?.includes(currentUser.uid);
          
          if (!isOwner) return null;

          return (
            <div className="flex justify-end p-1 cursor-default" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-muted/80">
                    <span className="sr-only">Open menu</span>
                    <EllipsisHorizontalIcon className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/10 text-xs"
                    onClick={() => onDelete?.(resource)}
                  >
                    <TrashIcon className="mr-2 h-3.5 w-3.5" />
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
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
    },
  })

  // Loading state
  if ((loadingResources || authLoading) && resourceList.length === 0) {
     return (
        <div className="rounded-xl border border-border/40 overflow-hidden bg-background/50 backdrop-blur-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                {columns.map((_, i) => (
                  <TableHead key={i} className="h-10 px-4">
                    <Skeleton className="h-3 w-16" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="border-b border-border/20 last:border-0 h-[53px]">
                   <TableCell className="px-4">
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-[180px]" />
                        <Skeleton className="h-3 w-[120px]" />
                      </div>
                   </TableCell>
                   <TableCell className="px-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3.5 w-3.5 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                   </TableCell>
                   <TableCell className="px-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3.5 w-3.5 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                   </TableCell>
                   <TableCell className="px-4">
                     <div className="flex -space-x-1">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                     </div>
                   </TableCell>
                   <TableCell className="px-4">
                      <Skeleton className="h-3 w-20" />
                   </TableCell>
                   <TableCell className="px-4">
                      <div className="flex justify-end">
                        <Skeleton className="h-6 w-6 rounded-md" />
                      </div>
                   </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full rounded-xl border border-border/40 overflow-hidden bg-background/50 backdrop-blur-sm shadow-sm">
      <div className="flex-1 overflow-auto min-h-0">
        <Table className="relative">
          <TableHeader className="bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-border/40 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-10 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 px-4">
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
                  className="group cursor-pointer hover:bg-muted/50 border-b border-border/20 transition-all duration-200 last:border-0"
                  onClick={() => {
                      onRowClick?.(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 group-hover:border-transparent">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-[400px] text-center p-0 hover:bg-transparent">
                  <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                      <div className="relative bg-background border border-border/50 rounded-2xl p-4 shadow-xl">
                        {resourceType === 'forms' ? (
                          <CheckCircleIcon className="h-10 w-10 text-primary/60" />
                        ) : (
                          <ArrowsUpDownIcon className="h-10 w-10 text-primary/60" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-foreground tracking-tight">No {resourceType} found</h3>
                      <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                        Start by creating your first {resourceType.slice(0, -1)} to get things moving.
                      </p>
                    </div>
                    {onCreate && (
                      <Button 
                        onClick={onCreate}
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-border/50 shadow-sm hover:bg-muted/50 transition-all duration-200 font-medium px-4"
                      >
                        <PlusIcon className="h-3.5 w-3.5 mr-2 opacity-60" />
                        Create {resourceType.slice(0, -1)}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/10 border-t border-border/40 shrink-0">
        <div className="text-[11px] font-medium text-muted-foreground/60">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        
        <div className="flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-medium text-muted-foreground/70">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-7 w-[65px] text-[11px] font-semibold bg-transparent border-border/30 rounded-md ring-offset-0 focus:ring-0">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top" className="min-w-[65px]">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`} className="text-[11px]">
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center text-[11px] font-semibold text-muted-foreground/80 min-w-max">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              className="hidden h-7 w-7 p-0 lg:flex border-border/30 bg-transparent hover:bg-muted/50"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronDoubleLeftIcon className="h-3.5 w-3.5 opacity-60" />
            </Button>
            <Button
              variant="outline"
              className="h-7 w-7 p-0 border-border/30 bg-transparent hover:bg-muted/50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-3.5 w-3.5 opacity-60" />
            </Button>
            <Button
              variant="outline"
              className="h-7 w-7 p-0 border-border/30 bg-transparent hover:bg-muted/50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-3.5 w-3.5 opacity-60" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-7 w-7 p-0 lg:flex border-border/30 bg-transparent hover:bg-muted/50"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronDoubleRightIcon className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
