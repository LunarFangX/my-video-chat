'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Video, VideoOff } from 'lucide-react';

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [partner, setPartner] = useState<string | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [userId] = useState(() => crypto.randomUUID()); // Generate random ID for testing
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase.channel('online-users');

    const cleanup = async () => {
      await supabase.from('active_users').delete().eq('id', userId);
      await channel.unsubscribe();
    };

    window.addEventListener('beforeunload', cleanup);

    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [userId]);

  const findPartner = async () => {
    setIsLoading(true);
    try {
      // Add user to active users
      await supabase.from('active_users').insert({
        id: userId,
        last_active: new Date().toISOString(),
      });

      // Subscribe to changes
      const channel = supabase.channel('matching');
      channel
        .on('presence', { event: 'sync' }, () => {
          // Handle presence sync
        })
        .subscribe();

      // Find a partner
      const { data: partner } = await supabase
        .from('active_users')
        .select('id')
        .neq('id', userId)
        .limit(1)
        .single();

      if (partner) {
        setPartner(partner.id);
        // Create a room URL for testing
        const roomUrl = `https://subdomain.whereby.com/${Math.random().toString(36).substring(7)}`;
        setRoomUrl(roomUrl);
      } else {
        toast({
          title: 'No partners available',
          description: 'Please try again in a moment.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error finding partner:', error);
      toast({
        title: 'Error',
        description: 'Failed to find a chat partner. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextPartner = async () => {
    setPartner(null);
    setRoomUrl(null);
    await findPartner();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="p-4">
          {!partner && !isLoading && (
            <div className="text-center py-12">
              <Video className="mx-auto h-12 w-12 mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-4">Start Video Chat</h2>
              <p className="text-muted-foreground mb-6">
                Click the button below to find a random chat partner
              </p>
              <Button onClick={findPartner} size="lg">
                Find Partner
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 mb-4 animate-spin text-primary" />
              <h2 className="text-2xl font-bold mb-4">Finding a Partner</h2>
              <p className="text-muted-foreground">Please wait while we connect you...</p>
            </div>
          )}

          {partner && roomUrl && (
            <div>
              <div className="aspect-video mb-4">
                <iframe
                  src={roomUrl}
                  allow="camera; microphone; fullscreen; speaker; display-capture"
                  className="w-full h-full rounded-lg"
                ></iframe>
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={nextPartner} variant="secondary">
                  Next Partner
                </Button>
                <Button onClick={() => window.location.reload()} variant="destructive">
                  End Chat
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}