import { WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-muted p-6">
              <WifiOff className="h-12 w-12 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">You're Offline</h1>
              <p className="text-muted-foreground">
                It looks like you've lost your internet connection. 
                Some features may not be available until you're back online.
              </p>
            </div>

            <div className="pt-4 space-y-2 text-sm text-muted-foreground text-left w-full">
              <p className="font-semibold">What you can still do:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>View cached tasks and projects</li>
                <li>Browse previously loaded pages</li>
                <li>Access the app interface</li>
              </ul>
              
              <p className="font-semibold pt-4">What requires connection:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Creating new tasks or projects</li>
                <li>Updating task status</li>
                <li>Loading new data</li>
                <li>API operations</li>
              </ul>
            </div>

            <div className="pt-4 text-sm text-muted-foreground">
              <p>Check your internet connection and try again.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
