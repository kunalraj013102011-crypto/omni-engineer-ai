import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Lesson {
  id: string;
  day_number: number;
  title: string;
  content: string;
  field: string;
  difficulty: string;
  completed?: boolean;
}

export function DailyLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('daily_lessons')
        .select('*')
        .order('day_number');

      if (lessonsError) throw lessonsError;

      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      const completedIds = new Set(progressData?.map(p => p.lesson_id) || []);
      const lessonsWithProgress = lessonsData?.map(lesson => ({
        ...lesson,
        completed: completedIds.has(lesson.id)
      })) || [];

      setLessons(lessonsWithProgress);
      
      // Auto-select first incomplete lesson
      const firstIncomplete = lessonsWithProgress.find(l => !l.completed);
      if (firstIncomplete) {
        setSelectedLesson(firstIncomplete);
      } else if (lessonsWithProgress.length > 0) {
        setSelectedLesson(lessonsWithProgress[0]);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (lessonId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_lesson_progress')
        .insert({ user_id: user.id, lesson_id: lessonId });

      if (error) throw error;

      toast.success('Lesson completed!');
      
      // Move to next lesson
      const currentIndex = lessons.findIndex(l => l.id === lessonId);
      if (currentIndex < lessons.length - 1) {
        setSelectedLesson(lessons[currentIndex + 1]);
      }
      
      loadLessons();
    } catch (error) {
      console.error('Error marking complete:', error);
      toast.error('Failed to mark lesson as complete');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading lessons...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      <div className="md:col-span-1">
        <ScrollArea className="h-[600px]">
          <div className="space-y-2 p-4">
            {lessons.map((lesson) => (
              <Card
                key={lesson.id}
                className={`cursor-pointer transition-colors ${
                  selectedLesson?.id === lesson.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedLesson(lesson)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start gap-2">
                    {lesson.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">Day {lesson.day_number}</div>
                      <div className="text-sm truncate">{lesson.title}</div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {lesson.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="md:col-span-2">
        {selectedLesson ? (
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Day {selectedLesson.day_number}: {selectedLesson.title}</CardTitle>
                  <CardDescription className="mt-2">
                    <Badge>{selectedLesson.field.replace('_', ' ')}</Badge>
                    <Badge variant="outline" className="ml-2">{selectedLesson.difficulty}</Badge>
                  </CardDescription>
                </div>
                {selectedLesson.completed && (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="prose prose-sm max-w-none">
                  <p>{selectedLesson.content}</p>
                </div>
              </ScrollArea>
              {!selectedLesson.completed && (
                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    onClick={() => markComplete(selectedLesson.id)}
                  >
                    Mark as Done <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent>
              <p className="text-muted-foreground">Select a lesson to begin</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
