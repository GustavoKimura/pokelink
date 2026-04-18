import { useEffect, useRef } from "react";

interface BattleLogProps {
  messages: string[];
}

export default function BattleLog({ messages }: BattleLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="space-y-1">
      {messages.map((msg, index) => (
        <p key={index} className="text-sm text-gray-300">
          {msg}
        </p>
      ))}
      <div ref={logEndRef} />
    </div>
  );
}
