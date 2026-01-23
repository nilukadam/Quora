import ans1 from "../assets/answers/Ans 1.jpeg";
import ans2 from "../assets/answers/ans 2.jpg";
import amit from "../assets/profiles/amit.jpg";
import anjali from "../assets/profiles/anjali.jpg";

export const postsData = [
  {
    id: "p1",
    type: "question",
    title: "What are the best ways to learn React?",
    content: "To learn React effectively, start with the official React documentation to understand the core concepts and mental model. Then build small practical applications to apply what you learn, experiment with state management and component composition, and focus deeply on hooks like useState, useEffect, and custom hooks to gain real-world confidence.",
    image: ans1,
    author: { name: "Amit Kumar", avatar: amit, profession: "Frontend Developer" },
    createdAt: "2025-10-01T08:00:00Z",
    upvotes: 45,
    downvotes: 3,
    comments: 0,
    followed: false,
    font: "inherit",
  },
  {
    id: "p2",
    type: "post",
    content: "React 19 is amazing, especially with the introduction of the new useOptimistic hook. It makes handling asynchronous UI updates much simpler by allowing developers to update the UI optimistically while background operations are still in progress, improving user experience, perceived performance, and overall application responsiveness in modern React apps.",
    image: ans2,
    author: { name: "Anjali Mehta", avatar: anjali, profession: "Software Engineer" },
    createdAt: "2025-09-30T15:00:00Z",
    upvotes: 32,
    downvotes: 2,
    comments: 0,
    followed: true,
    font: "Arial, sans-serif",
  },
  // Add 3–4 more posts...
];
