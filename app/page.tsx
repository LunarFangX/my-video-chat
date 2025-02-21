import Link from 'next/link'
import { Video, Users } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Random Video Chat</h1>
          <p className="text-muted-foreground mb-12">
            Connect with people around the world through instant video chat
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Active Users</h2>
              </div>
              <p className="text-muted-foreground mb-2">Join thousands of users online right now</p>
              <div className="text-4xl font-bold text-primary">2,481</div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Video className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Live Chats</h2>
              </div>
              <p className="text-muted-foreground mb-2">Active video conversations happening</p>
              <div className="text-4xl font-bold text-primary">946</div>
            </div>
          </div>

          <Link 
            href="/chat" 
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start Chatting
          </Link>
        </div>
      </div>
    </main>
  )
}