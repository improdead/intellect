import {
  Sunrise,
  Moon,
  Dumbbell,
  Utensils,
  Calendar,
  CalendarDays,
  CalendarRange,
  Undo2,
  Flag,
  Compass,
  BookOpen,
  GraduationCap,
  ListChecks,
  Zap,
  CheckCircle2,
  Timer,
  Gauge,
  Clock3,
  Lightbulb,
  Award,
  Trophy,
} from "lucide-react";

// Achievement definitions with icons
export const ACHIEVEMENT_ICONS = {
  // Time-based achievements
  "Early Bird": <Sunrise className="h-10 w-10 text-amber-500" />,
  "Night Owl": <Moon className="h-10 w-10 text-indigo-600" />,
  "Weekend Warrior": <Dumbbell className="h-10 w-10 text-red-500" />,
  "Lunch Break Learner": <Utensils className="h-10 w-10 text-orange-500" />,
  
  // Consistency achievements
  "Consistent Learner": <Calendar className="h-10 w-10 text-emerald-500" />,
  "Monthly Master": <CalendarDays className="h-10 w-10 text-teal-500" />,
  "Quarterly Quest": <CalendarRange className="h-10 w-10 text-cyan-500" />,
  "Comeback Kid": <Undo2 className="h-10 w-10 text-violet-500" />,
  
  // Topic achievements
  "Topic Starter": <Flag className="h-10 w-10 text-green-500" />,
  "Topic Explorer": <Compass className="h-10 w-10 text-blue-400" />,
  "Topic Master": <BookOpen className="h-10 w-10 text-blue-500" />,
  "Subject Specialist": <GraduationCap className="h-10 w-10 text-purple-600" />,
  
  // Quiz achievements
  "Quiz Taker": <ListChecks className="h-10 w-10 text-gray-600" />,
  "Quiz Whiz": <Zap className="h-10 w-10 text-yellow-500" />,
  "Quiz Champion": <CheckCircle2 className="h-10 w-10 text-indigo-500" />,
  "Speed Demon": <Timer className="h-10 w-10 text-red-600" />,
  
  // Study achievements
  "Study Sprint": <Gauge className="h-10 w-10 text-blue-600" />,
  "Study Marathon": <Clock3 className="h-10 w-10 text-purple-500" />,
  "Knowledge Seeker": <Lightbulb className="h-10 w-10 text-yellow-600" />,
  "Grand Master": <Award className="h-10 w-10 text-amber-600" />,
};
