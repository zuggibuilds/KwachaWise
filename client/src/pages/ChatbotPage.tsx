import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiPost } from '../api/client';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ChatbotPage() {
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createId(),
      role: 'assistant',
      content: 'Hi! I am your KwachaWise assistant. Ask me about saving, budgeting, goals, or spending patterns.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sentPromptRef = useRef<string | null>(null);

  const prompt = useMemo(() => new URLSearchParams(location.search).get('prompt') ?? '', [location.search]);

  useEffect(() => {
    if (!prompt || sentPromptRef.current === prompt) return;
    sentPromptRef.current = prompt;
    void submitMessage(prompt);
  }, [prompt]);

  async function submitMessage(raw: string): Promise<void> {
    const text = raw.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { id: createId(), role: 'user', content: text };
    const baseMessages = [...messages, userMessage];
    setMessages(baseMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await apiPost<{ reply: string; suggestions: string[] }>('/ai/chat', {
        message: text,
        history: baseMessages.slice(-8).map((message) => ({ role: message.role, content: message.content }))
      });

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content: response.reply
        }
      ]);

      if (response.suggestions.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: 'assistant',
            content: `Try asking: ${response.suggestions.slice(0, 3).join(' • ')}`
          }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content: error instanceof Error ? `I couldn't answer right now: ${error.message}` : "I couldn't answer right now."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submitMessage(input);
  }

  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-900">AI Chatbot</h2>
        <p className="text-xs text-slate-500">Ask about savings, budgets, spending, and goals.</p>
      </div>

      <div className="max-h-[55vh] space-y-3 overflow-y-auto rounded-xl border border-brand-100 bg-brand-50 p-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
              message.role === 'user' ? 'ml-auto bg-brand-700 text-white' : 'bg-white text-slate-700'
            }`}
          >
            {message.content}
          </div>
        ))}
        {loading ? <p className="text-xs text-slate-500">Assistant is typing...</p> : null}
      </div>

      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask your finance question..."
          className="h-10 flex-1 rounded-xl border border-brand-200 px-3 text-sm outline-none ring-brand-300 focus:ring-2"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-10 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </section>
  );
}
