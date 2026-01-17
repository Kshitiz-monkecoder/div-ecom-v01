// app/admin/tokens/page.tsx
"use client"; // needed for client-side interactivity

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  tokens: number;
}

export default function TokensPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/tokens")
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  const adjustTokens = async (id: string, amount: number) => {
    await fetch(`/api/admin/tokens/${id}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    // refresh list
    const updated = await fetch("/api/admin/tokens").then(res => res.json());
    setUsers(updated);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Email</th><th>Tokens</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td>{u.id}</td>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.tokens}</td>
            <td>
              <button onClick={() => adjustTokens(u.id, 10)}>+10</button>
              <button onClick={() => adjustTokens(u.id, -5)}>-5</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
