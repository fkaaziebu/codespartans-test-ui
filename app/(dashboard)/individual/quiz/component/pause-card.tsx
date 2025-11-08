import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PauseData {
  pausedAt: number;
  timeLeft: number;
}

interface PauseCardProps {
  pauseData: PauseData;
  onResume: () => void;
}

export default function PauseCard({ pauseData, onResume }: PauseCardProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Test Paused</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Test is currently paused, can resume the test anytime within the
            stipulated pause time.
          </p>
          {pauseData && (
            <div className="mb-4">
              <Badge variant="outline">Paused At: {pauseData.pausedAt}</Badge>
            </div>
          )}
          <p className="text-lg font-semibold">
            Time Remaining:{" "}
            {`${Math.floor(pauseData.timeLeft / 60)}:${(pauseData.timeLeft % 60)
              .toString()
              .padStart(2, "0")}`}
          </p>
          <Button onClick={onResume} className="mt-4">
            Resume Test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
