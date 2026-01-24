import { MailPlus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UsersPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1 bg-dark'
      >
        <span>Invite User</span> <MailPlus size={18} />
      </Button>
      <Button className='space-x-1' >
        <span>Add User</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
