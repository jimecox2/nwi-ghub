'use client'

import { useState, useEffect } from 'react'
import { Share2, Loader2, X, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getUsersByCustomerId, updateDashboardSource } from '@/lib/crud/coreCrud'
import { FULL_ACCESS_ADMIN_TOKEN } from '@/config/index'

/**
 * Share Dialog Component
 * Allows sharing dashboard sources with other users in the same organization
 */
const ShareDialog = ({ source, isOpen, onClose, onSuccess, customerId, jwt }) => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sharedEmails, setSharedEmails] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && customerId) {
      fetchUsers()
    }
  }, [isOpen, customerId])

  useEffect(() => {
    if (source) {
      // Parse existing shared emails
      const emails = source.grant_tm_access_to
        ? source.grant_tm_access_to.split(',').map(e => e.trim()).filter(e => e)
        : []
      setSharedEmails(emails)
    }
  }, [source])

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const userList = await getUsersByCustomerId(customerId, jwt)
      // Filter out the owner
      const filtered = userList.filter(u => u.email !== source.owner)
      setUsers(filtered)
      setFilteredUsers(filtered)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = (email) => {
    if (!sharedEmails.includes(email)) {
      setSharedEmails([...sharedEmails, email])
    }
  }

  const handleRemoveUser = (email) => {
    setSharedEmails(sharedEmails.filter(e => e !== email))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedData = {
        grant_tm_access_to: sharedEmails.join(','),
      }

      await updateDashboardSource(source.id, updatedData, FULL_ACCESS_ADMIN_TOKEN)

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (err) {
      console.error('Error saving share settings:', err)
      alert('Failed to save share settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Dashboard Source
          </DialogTitle>
          <DialogDescription>
            Share "{source?.name}" with other users in your organization
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4 py-4">
          {/* Currently Shared */}
          {sharedEmails.length > 0 && (
            <div>
              <Label>Currently Shared With ({sharedEmails.length})</Label>
              <div className="mt-2 space-y-2">
                {sharedEmails.map(email => {
                  const user = users.find(u => u.email === email)
                  return (
                    <div
                      key={email}
                      className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user?.name || email}</p>
                        <p className="text-xs text-gray-600">{email}</p>
                        {user && <span className="text-xs text-gray-500">{user.role}</span>}
                      </div>
                      <button
                        onClick={() => handleRemoveUser(email)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                        title="Remove access"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Search Users */}
          <div>
            <Label>Add Users</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* User List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {searchTerm ? 'No users found matching your search' : 'No users available'}
                </div>
              ) : (
                filteredUsers.map(user => {
                  const alreadyShared = sharedEmails.includes(user.email)
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50 ${
                        alreadyShared ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{user.name}</p>
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                      </div>
                      {alreadyShared ? (
                        <span className="text-xs text-green-600 font-medium">Shared</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddUser(user.email)}
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ShareDialog
