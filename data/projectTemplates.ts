export const ProjectTemplates = {
  "Todo App": {
    // Enhanced metadata
    description:
      "A beautiful, interactive todo list with animations and modern UI components",
    difficulty: "Beginner",
    tags: ["React", "Tailwind", "Motion", "CRUD"],
    features: [
      "Add/Delete Tasks",
      "Mark Complete",
      "Smooth Animations",
      "Responsive Design",
    ],
    popularity: 4.8,
    color: "from-blue-500 to-indigo-600",

    // Original file structure
    "/index.html": {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
    },
    "/package.json": {
      code: `{
  "name": "vite-react-tailwind-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "motion": "^12.19.2",
    "lucide-react": "^0.276.0",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.15",
    "postcss": "^8.4.24"
  },
  "devDependencies": {
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.1.0"
  },
  "packageManager": "pnpm@8.15.4"
}`,
    },
    "/pnpm-lock.yaml": {
      code: `lockfileVersion: '6.0'
packageManager: pnpm@8.15.4
importers:
  .:
    dependencies:
      autoprefixer: 10.4.15
      motion: 12.19.2
      lucide-react: 0.276.0
      postcss: 8.4.24
      react: 18.2.0
      react-dom: 18.2.0
      tailwindcss: 3.4.1
    devDependencies:
      '@vitejs/plugin-react': 4.1.0
      vite: 5.2.0
`,
    },
    "/postcss.config.js": {
      code: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
    },
    "/src/App.jsx": {
      code: `import { useState } from 'react';
import { motion } from 'motion/react';
import AddTodoForm from './components/AddTodoForm';
import TodoList from './components/TodoList';

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React Hooks', completed: false },
    { id: 2, text: 'Master Tailwind CSS', completed: true },
    { id: 3, text: 'Build a Todo App', completed: false },
  ]);

  const addTodo = (text) => {
    if (text.trim() === '') return;
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
    };
    setTodos((prevTodos) => [...prevTodos, newTodo]);
  };

  const toggleComplete = (id) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
    >
      <motion.h1
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-5xl font-extrabold text-gray-800 mb-8 drop-shadow-lg"
      >
        My Todo List
      </motion.h1>
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 space-y-6 border border-gray-100">
        <AddTodoForm addTodo={addTodo} />
        <TodoList
          todos={todos}
          toggleComplete={toggleComplete}
          deleteTodo={deleteTodo}
        />
      </div>
    </motion.div>
  );
}
`,
    },
    "/src/components/AddTodoForm.jsx": {
      code: `import { useState } from 'react';
import { motion } from 'motion/react';

export default function AddTodoForm({ addTodo }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addTodo(inputValue);
    setInputValue('');
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="flex gap-3"
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Add a new todo..."
        className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 text-gray-800 placeholder-gray-400"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition duration-200 font-semibold"
      >
        Add Todo
      </motion.button>
    </motion.form>
  );
}
`,
    },
    "/src/components/TodoItem.jsx": {
      code: `import { motion } from 'motion/react';
import { CheckCircle, Circle, Trash2 } from 'lucide-react';

export default function TodoItem({ todo, toggleComplete, deleteTodo }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className={\`flex items-center justify-between p-4 rounded-lg shadow-sm transition-all duration-300 ease-in-out
        \${todo.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}
      \`}
    >
      <div
        className="flex items-center flex-grow cursor-pointer"
        onClick={() => toggleComplete(todo.id)}
      >
        {todo.completed ? (
          <CheckCircle className="text-green-600 w-6 h-6 mr-3 flex-shrink-0" />
        ) : (
          <Circle className="text-gray-400 w-6 h-6 mr-3 flex-shrink-0" />
        )}
        <span
          className={\`text-lg font-medium transition-all duration-300
            \${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}
          \`}
        >
          {todo.text}
        </span>
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => deleteTodo(todo.id)}
        className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label="Delete todo"
      >
        <Trash2 className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}
`,
    },
    "/src/components/TodoList.jsx": {
      code: `import { motion, AnimatePresence } from 'motion/react';
import TodoItem from './TodoItem';

export default function TodoList({ todos, toggleComplete, deleteTodo }) {
  return (
    <motion.div
      layout
      className="space-y-3"
    >
      <AnimatePresence>
        {todos.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-500 py-4 text-lg"
          >
            No todos yet! Add some tasks.
          </motion.p>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              toggleComplete={toggleComplete}
              deleteTodo={deleteTodo}
            />
          ))
        )}
      </AnimatePresence>
    </motion.div>
  );
}
`,
    },
    "/src/index.css": {
      code: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
    },
    "/src/main.jsx": {
      code: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    },
    "/tailwind.config.js": {
      code: `export default {
  content: ["./index.html", "./**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};`,
    },
    "/vite.config.js": {
      code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});`,
    },
  },
  "Notes App": {
    // Enhanced metadata
    description:
      "Simple note-taking application with create, read, and delete functionality",
    difficulty: "Beginner",
    tags: ["React", "Tailwind", "Local Storage"],
    features: ["Create Notes", "Delete Notes", "Auto-save", "Clean Interface"],
    popularity: 4.6,
    color: "from-yellow-500 to-orange-600",

    "/index.html": {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
    },
    "/package.json": {
      code: `{
  "name": "vite-react-tailwind-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "motion": "^12.19.2",
    "lucide-react": "^0.276.0",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.15",
    "postcss": "^8.4.24"
  },
  "devDependencies": {
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.1.0"
  },
  "packageManager": "pnpm@8.15.4"
}`,
    },
    "/pnpm-lock.yaml": {
      code: `lockfileVersion: '6.0'
packageManager: pnpm@8.15.4
importers:
  .:
    dependencies:
      autoprefixer: 10.4.15
      lucide-react: 0.276.0
      motion: 12.19.2
      postcss: 8.4.24
      react: 18.2.0
      react-dom: 18.2.0
      tailwindcss: 3.4.1
    devDependencies:
      '@vitejs/plugin-react': 4.1.0
      vite: 5.2.0`,
    },
    "/postcss.config.js": {
      code: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
    },
    "/src/App.jsx": {
      code: `import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import AddNoteForm from "./components/AddNoteForm";
import NotesList from "./components/NotesList";

export default function App() {
  const [notes, setNotes] = useState(() => {
    // Load notes from localStorage on initial mount
    const savedNotes = localStorage.getItem("notes");
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  // Save notes to localStorage whenever the notes array changes
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = (content) => {
    if (content.trim() === "") return;
    const newNote = {
      id: Date.now(), // Simple unique ID
      content: content.trim(),
    };
    setNotes((prevNotes) => [newNote, ...prevNotes]);
  };

  const deleteNote = (id) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-4 sm:p-6 md:p-8"
    >
      <motion.h1
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-8 text-center drop-shadow-sm"
      >
        My Notes App
      </motion.h1>

      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl p-6 sm:p-8 mb-8 border border-gray-100">
        <AddNoteForm onAddNote={addNote} />
      </div>

      <div className="w-full max-w-xl">
        {notes.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 text-lg mt-10"
          >
            No notes yet. Start by adding one!
          </motion.p>
        ) : (
          <NotesList notes={notes} onDeleteNote={deleteNote} />
        )}
      </div>
    </motion.div>
  );
}`,
    },
    "/src/components/AddNoteForm.jsx": {
      code: `import { useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";

export default function AddNoteForm({ onAddNote }) {
  const [newNoteContent, setNewNoteContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddNote(newNoteContent);
    setNewNoteContent("");
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-4"
    >
      <input
        type="text"
        placeholder="What's on your mind?"
        value={newNoteContent}
        onChange={(e) => setNewNoteContent(e.target.value)}
        className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="flex-shrink-0 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
      >
        <Plus size={20} />
        Add Note
      </motion.button>
    </motion.form>
  );
}`,
    },
    "/src/components/NoteItem.jsx": {
      code: `import { motion } from "motion/react";
import { Trash2 } from "lucide-react";

export default function NoteItem({ note, onDelete }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative bg-white p-5 rounded-lg shadow-lg border border-gray-100 flex flex-col justify-between group hover:shadow-xl transition-shadow duration-300"
    >
      <p className="text-gray-800 text-lg leading-relaxed mb-4 pr-10 break-words">
        {note.content}
      </p>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onDelete(note.id)}
        className="absolute top-3 right-3 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        aria-label="Delete note"
      >
        <Trash2 size={18} />
      </motion.button>
    </motion.li>
  );
}`,
    },
    "/src/components/NotesList.jsx": {
      code: `import { motion, AnimatePresence } from "motion/react";
import NoteItem from "./NoteItem";

export default function NotesList({ notes, onDeleteNote }) {
  return (
    <motion.ul
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <AnimatePresence>
        {notes.map((note) => (
          <NoteItem key={note.id} note={note} onDelete={onDeleteNote} />
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}`,
    },
    "/src/index.css": {
      code: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
    },
    "/src/main.jsx": {
      code: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    },
    "/tailwind.config.js": {
      code: `export default {
  content: ["./index.html", "./**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};`,
    },
    "/vite.config.js": {
      code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});`,
    },
  },
  "Expense Tracker": {
    description:
      "Track your income and expenses with real-time balance calculation",
    difficulty: "Intermediate",
    tags: ["React", "Finance", "Charts", "State Management"],
    features: [
      "Add Transactions",
      "Balance Tracking",
      "Expense Categories",
      "Visual Feedback",
    ],
    popularity: 4.7,
    color: "from-green-500 to-emerald-600",

    "/index.html": {
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  },
  "/package.json": {
    code: `{
  "name": "vite-react-tailwind-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "motion": "^12.19.2",
    "lucide-react": "^0.276.0",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.15",
    "postcss": "^8.4.24",
    "clsx": "^2.1.1",
    "class-variance-authority": "^0.7.0",
    "tailwind-variants": "^0.1.6",
    "@radix-ui/react-select": "^1.2.2",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.1.0"
  },
  "packageManager": "pnpm@8.15.4"
}`,
  },
  "/pnpm-lock.yaml": {
    code: `lockfileVersion: '6.0'
packageManager: pnpm@8.15.4

importers:
  .:
    dependencies:
      '@radix-ui/react-select':
        specifier: ^1.2.2
        version: 1.2.2
      autoprefixer:
        specifier: ^10.4.15
        version: 10.4.15
      class-variance-authority:
        specifier: ^0.7.0
        version: 0.7.0
      clsx:
        specifier: ^2.1.1
        version: 2.1.1
      lucide-react:
        specifier: ^0.276.0
        version: 0.276.0
      motion:
        specifier: ^12.19.2
        version: 12.19.2
      postcss:
        specifier: ^8.4.24
        version: 8.4.24
      react:
        specifier: ^18.2.0
        version: 18.2.0
      react-dom:
        specifier: ^18.2.0
        version: 18.2.0
      tailwind-merge:
        specifier: ^2.3.0
        version: 2.3.0
      tailwind-variants:
        specifier: ^0.1.6
        version: 0.1.6
      tailwindcss:
        specifier: ^3.4.1
        version: 3.4.1
    devDependencies:
      '@vitejs/plugin-react':
        specifier: ^4.1.0
        version: 4.1.0
      vite:
        specifier: ^5.2.0
        version: 5.2.0
`,
  },
  "/postcss.config.js": {
    code: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
  },
  "/src/App.jsx": {
    code: `import { useState, useEffect } from "react";
import { motion } from "motion/react";
import BalanceDisplay from "@/components/BalanceDisplay";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import { DollarSign } from "lucide-react";

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem("transactions");
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const newBalance = transactions.reduce((acc, transaction) => {
      return transaction.type === "income"
        ? acc + transaction.amount
        : acc - transaction.amount;
    }, 0);
    setBalance(newBalance);
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (newTransaction) => {
    setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-purple-50 p-6 sm:p-8"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        className="flex items-center gap-3 text-4xl font-extrabold text-gray-800 mb-8 mt-4 sm:mt-8"
      >
        <DollarSign className="text-blue-600 w-10 h-10" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Budget Tracker
        </span>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        <div className="md:col-span-1 lg:col-span-1 flex justify-center">
          <BalanceDisplay balance={balance} />
        </div>
        <div className="md:col-span-1 lg:col-span-1 flex justify-center">
          <TransactionForm addTransaction={addTransaction} />
        </div>
        <div className="md:col-span-2 lg:col-span-1 flex justify-center">
          <TransactionList transactions={transactions} />
        </div>
      </div>

      <footer className="mt-12 text-gray-500 text-sm">
        Built with React, Tailwind CSS, and Framer Motion
      </footer>
    </motion.div>
  );
}`,
  },
  "/src/components/BalanceDisplay.jsx": {
    code: `import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function BalanceDisplay({ balance }) {
  const balanceColorClass = balance >= 0 ? "text-green-600" : "text-red-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-lg border-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Current Balance
          </CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className={\`text-4xl font-bold \${balanceColorClass}\`}>
            \${balance.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Your financial overview
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}`,
  },
  "/src/components/TransactionForm.jsx": {
    code: `import { useState } from "react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, DollarSign, Tag, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionForm({ addTransaction }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense"); // 'income' or 'expense'
  const [category, setCategory] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount || !type || !category) {
      alert("Please fill in all fields.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toLocaleDateString(),
    };

    addTransaction(newTransaction);
    setDescription("");
    setAmount("");
    setCategory("");
    setType("expense"); // Reset to default
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-lg border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <PlusCircle className="h-5 w-5 text-blue-500" /> Add New Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="description" className="sr-only">Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="description"
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="amount" className="sr-only">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="type" className="sr-only">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="category" className="sr-only">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="category"
                  type="text"
                  placeholder="Category (e.g., Food, Salary)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Add Transaction
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}`,
  },
  "/src/components/TransactionItem.jsx": {
    code: `import { motion } from "motion/react";
import { ArrowUpCircle, ArrowDownCircle, Tag } from "lucide-react";

export default function TransactionItem({ transaction }) {
  const isIncome = transaction.type === "income";
  const amountColorClass = isIncome ? "text-green-600" : "text-red-600";
  const icon = isIncome ? <ArrowUpCircle className="h-5 w-5 text-green-500" /> : <ArrowDownCircle className="h-5 w-5 text-red-500" />;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 mb-3 last:mb-0"
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="font-medium text-gray-800">{transaction.description}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Tag className="h-3 w-3" /> {transaction.category}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={\`font-semibold \${amountColorClass}\`}>
          {isIncome ? "+" : "-"}\${transaction.amount.toFixed(2)}
        </p>
        <p className="text-xs text-gray-400">{transaction.date}</p>
      </div>
    </motion.li>
  );
}`,
  },
  "/src/components/TransactionList.jsx": {
    code: `import { motion, AnimatePresence } from "motion/react";
import TransactionItem from "./TransactionItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

export default function TransactionList({ transactions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-lg border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ListChecks className="h-5 w-5 text-purple-500" /> Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No transactions yet. Add one above!</p>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence>
                {transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}`,
  },
  "/src/components/ui/button.jsx": {
    code: `import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? motion.span : motion.button;
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
`,
  },
  "/src/components/ui/card.jsx": {
    code: `import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
`,
  },
  "/src/components/ui/input.jsx": {
    code: `import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
`,
  },
  "/src/components/ui/select.jsx": {
    code: `import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
`,
  },
  "/src/index.css": {
    code: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
  },
  "/src/lib/utils.js": {
    code: `import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
`,
  },
  "/src/main.jsx": {
    code: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  },
  "/tailwind.config.js": {
    code: `export default {
  content: ["./index.html", "./**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};`,
  },
  "/vite.config.js": {
    code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});`,
  },
  },
  "Simple Gallery": {
    // Enhanced metadata
    description:
      "Responsive image gallery with lightbox functionality and smooth transitions",
    difficulty: "Beginner",
    tags: ["React", "Images", "Modal", "Responsive"],
    features: [
      "Image Grid",
      "Lightbox View",
      "Responsive Layout",
      "Smooth Transitions",
    ],
    popularity: 4.5,
    color: "from-purple-500 to-pink-600",

    "/index.html": {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Simple Gallery</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
    },
    "/package.json": {
      code: `{
  "name": "simple-gallery",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "motion": "^12.19.2",
    "lucide-react": "^0.276.0",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.15",
    "postcss": "^8.4.24"
  },
  "devDependencies": {
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.1.0"
  },
  "packageManager": "pnpm@8.15.4"
}`,
    },
    "/pnpm-lock.yaml": {
      code: `lockfileVersion: '6.0'
packageManager: pnpm@8.15.4
importers:
  .:
    dependencies:
      autoprefixer: 10.4.15
      motion: 12.19.2
      lucide-react: 0.276.0
      postcss: 8.4.24
      react: 18.2.0
      react-dom: 18.2.0
      tailwindcss: 3.4.1
    devDependencies:
      '@vitejs/plugin-react': 4.1.0
      vite: 5.2.0
`,
    },
    "/postcss.config.js": {
      code: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
    },
    "/tailwind.config.js": {
      code: `export default {
  content: ["./index.html", "./**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};`,
    },
    "/vite.config.js": {
      code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});`,
    },
    "/src/main.jsx": {
      code: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    },
    "/src/index.css": {
      code: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
    },
    "/src/App.jsx": {
      code: `import { useState } from 'react';
import { motion } from 'motion/react';
import { ImageIcon } from 'lucide-react';

const images = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80"
];

export default function App() {
  const [selected, setSelected] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 p-4"
    >
      <motion.h1
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-4xl font-extrabold text-gray-800 mb-8 flex items-center gap-2"
      >
        <ImageIcon className="w-8 h-8 text-purple-500" />
        Simple Gallery
      </motion.h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((src, i) => (
          <motion.img
            key={i}
            src={src}
            alt="Gallery"
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelected(src)}
            className="rounded-lg shadow-lg cursor-pointer border-2 border-transparent hover:border-purple-400 transition"
            style={{ width: 180, height: 120, objectFit: "cover" }}
          />
        ))}
      </div>
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <motion.img
            src={selected}
            alt="Large"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="rounded-xl shadow-2xl border-4 border-white max-w-lg max-h-[80vh]"
          />
        </motion.div>
      )}
    </motion.div>
  );
}
`,
    },
  },
};
