import { SubjectWithIcon } from "./data-service";

// Fallback subjects data in case the database query fails
export const fallbackSubjects: SubjectWithIcon[] = [
  {
    id: "1",
    name: "Physics",
    description: "Study of matter, energy, and the interaction between them",
    difficulty: "Intermediate",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Mathematics",
    description: "Study of numbers, quantities, and shapes",
    difficulty: "Advanced",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Biology",
    description: "Study of living organisms and their interactions",
    difficulty: "Beginner",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Chemistry",
    description: "Study of substances, their properties, and reactions",
    difficulty: "Intermediate",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Computer Science",
    description: "Study of computers and computational systems",
    difficulty: "Advanced",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
