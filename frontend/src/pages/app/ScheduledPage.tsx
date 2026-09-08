import { CalendarClock, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

export function ScheduledPage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="vf-card flex flex-col items-center gap-3 p-12 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <CalendarClock className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">No scheduled tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Schedule a generation to run at a specific time — perfect for recurring content.
          </p>
        </div>
        <Button onClick={() => navigate('/app')}>
          <Sparkles className="h-4 w-4" /> Create a task
        </Button>
      </div>
    </div>
  );
}
