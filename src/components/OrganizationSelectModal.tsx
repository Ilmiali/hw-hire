'use client'

import * as Headless from '@headlessui/react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { setCurrentOrganization } from '../store/slices/organizationSlice'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export function OrganizationSelectModal() {
  const dispatch = useDispatch<AppDispatch>()
  const userData = useSelector((state: RootState) => state.auth.userData)
  const organizations = useSelector((state: RootState) => state.organization.organizations)
  const currentOrganization = useSelector((state: RootState) => state.organization.currentOrganization)
  const user = useSelector((state: RootState) => state.auth.user)
  const loading = useSelector((state: RootState) => state.organization.loading || state.auth.loading)

  const memberships = userData?.orgMemberships || []

  // Show modal only if user is logged in, has data, but no organization is selected
  const isOpen = !!user && !!userData && !currentOrganization && !loading

  const handleSelect = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId)
    if (org) {
      dispatch(setCurrentOrganization(org))
    }
  }

  return (
    <Headless.Transition show={isOpen}>
      <Headless.Dialog onClose={() => {}} className="relative z-50">
        <Headless.TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" />
        </Headless.TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Headless.TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Headless.DialogPanel className="relative transform overflow-hidden rounded-2xl bg-white/10 p-8 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-white/20 backdrop-blur-xl">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30">
                    <BuildingOfficeIcon className="h-8 w-8 text-indigo-400" aria-hidden="true" />
                  </div>
                  <div className="mt-6 text-center">
                    <Headless.DialogTitle as="h3" className="text-2xl font-bold leading-6 text-white">
                      Select an Organization
                    </Headless.DialogTitle>
                    <div className="mt-3">
                      <p className="text-sm text-zinc-300">
                        You need to select an organization to proceed. Please choose one from the list below.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 space-y-3">
                  {memberships.length > 0 ? (
                    memberships.map((membership) => (
                      <button
                        key={membership.id}
                        onClick={() => handleSelect(membership.id)}
                        className={clsx(
                          "w-full group flex items-center justify-between rounded-xl px-5 py-4 text-sm font-medium transition-all duration-200",
                          "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]",
                          "text-white shadow-sm"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-indigo-400 group-hover:scale-125 transition-transform" />
                          {membership.name}
                        </span>
                        <svg className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-6 px-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-sm text-zinc-400">No organizations found. Please contact your administrator.</p>
                    </div>
                  )}
                </div>
              </Headless.DialogPanel>
            </Headless.TransitionChild>
          </div>
        </div>
      </Headless.Dialog>
    </Headless.Transition>
  )
}
