"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askDocument() {
    if (!file) {
      setAnswer("Please upload a PDF first.");
      return;
    }

    if (!question.trim()) {
      setAnswer("Please enter a question.");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("question", question);

      const response = await fetch("/api/document", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze document");
      }

      setAnswer(data.answer);
    } catch (error) {
      console.error(error);

      setAnswer(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setAnswer("Only PDF files are allowed.");
      return;
    }

    setFile(selectedFile);
    setAnswer("");
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-zinc-900 px-6 py-14">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 shadow-2xs mb-4">
            <span>✨ AI Document Assistant</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            📚 DocMind
          </h1>

          <p className="mt-3 text-base text-zinc-500 max-w-md mx-auto">
            Upload a document and ask AI anything about it.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-7 sm:p-9 shadow-xl shadow-zinc-900/5">
          {/* Upload */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                1. Upload your PDF
              </h2>
              {file && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ready to query
                </span>
              )}
            </div>

            <label
              htmlFor="pdf-upload"
              className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
                file
                  ? "border-emerald-500/50 bg-emerald-50/20 hover:border-emerald-600"
                  : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-400 hover:bg-zinc-50"
              }`}>
              <div className="text-4xl transition-transform duration-200 group-hover:scale-110">
                {file ? "✅" : "📄"}
              </div>

              <p className="mt-3 font-semibold text-zinc-900">
                {file ? file.name : "Click to choose a PDF"}
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {file ? "Click to replace file" : "PDF files only"}
              </p>

              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {file && (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-zinc-200/70 bg-zinc-50/80 px-4 py-3 text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-zinc-200 text-base shadow-2xs">
                    📄
                  </span>
                  <span className="font-medium text-zinc-800 truncate">
                    {file.name}
                  </span>
                </div>

                <span className="shrink-0 rounded-md bg-zinc-200/60 px-2 py-1 font-mono text-xs text-zinc-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>

          {/* Question */}
          <div className="mt-9">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              2. Ask your document
            </h2>

            <div className="relative">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Example: What is the main objective of this research?"
                className="min-h-36 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50/40 p-4 text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-200 focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5"
              />
            </div>

            <button
              onClick={askDocument}
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 py-4 font-semibold text-white shadow-md shadow-zinc-900/10 transition-all duration-200 hover:bg-zinc-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100">
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Analyzing document...</span>
                </>
              ) : (
                <span>Ask DocMind →</span>
              )}
            </button>
          </div>

          {/* Answer */}
          {answer && (
            <div className="mt-9 rounded-2xl border border-zinc-200/90 bg-gradient-to-b from-zinc-50/80 to-white p-6 sm:p-7 shadow-xs animate-in fade-in duration-300">
              <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-sm shadow-xs">
                    🤖
                  </span>
                  <div>
                    <h2 className="font-semibold text-zinc-900 leading-none">
                      DocMind Answer
                    </h2>
                    <span className="text-[11px] text-zinc-400 font-medium mt-1 inline-block">
                      Generated response
                    </span>
                  </div>
                </div>
              </div>

              <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 text-[15px]">
                {answer}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-400">
          <span>Powered by</span>
          <span className="font-semibold text-zinc-600 tracking-tight">
            Gemini
          </span>
        </div>
      </div>
    </main>
  );
}
