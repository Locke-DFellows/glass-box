/**
 * Assignment Page - Server Component
 * 
 * This is a Next.js Server Component that runs on the server to fetch
 * the document from Supabase. It then passes the data to a Client Component
 * wrapper that hydrates the Zustand store.
 * 
 * Architecture Benefits:
 * - Fetch happens on the server (fast, close to the database)
 * - User sees the editor with content already loaded (no loading spinner)
 * - Authentication can be checked here before rendering
 * - Supabase calls use the service_role key (if needed) not just anon key
 * 
 * Flow:
 * 1. Server fetches document by params.id
 * 2. Server returns 404 if not found
 * 3. Server passes data to ClientEditorWrapper
 * 4. Client component hydrates Zustand store
 * 5. Canvas renders with content already loaded
 * 
 * Security:
 * - In production, verify params.id is a valid UUID
 * - Add middleware to check auth before this page renders
 * - Supabase RLS policies should check user_id on the server
 */

import { supabase } from '@/lib/supabase';
import ClientEditorWrapper from '@/app/assignments/[id]/ClientEditorWrapper';

/**
 * Error screen component - extracted from try/catch to follow React best practices
 */
function ErrorScreen({
  title,
  message,
  details,
}: {
  title: string;
  message: string;
  details?: string;
}) {
  return (
    <div className="ErrorScreen_Container_1">
      <div className="ErrorScreen_Content_1">
        <h1 className="ErrorScreen_Title_1">{title}</h1>
        <p className="ErrorScreen_Message_1">{message}</p>
        {details && <p className="ErrorScreen_Details_1">{details}</p>}
      </div>
    </div>
  );
}

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params to get the actual values (Next.js 16+ breaking change)
  const { id } = await params;

  // 1. Fetch the document from Supabase
  // Running on the server means:
  // - Faster: Direct connection to database, no browser network latency
  // - Safer: Can use server-side credentials if needed
  // - Better UX: Content included in initial HTML, no loading spinner
  const { data: doc, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  // 2. Handle not found / errors
  if (error) {
    console.error(`[Server] Failed to fetch document ${id}:`, error.message);
    return (
      <ErrorScreen
        title="Document Not Found"
        message="The assignment or connection to the database failed."
        details={error.message}
      />
    );
  }

  if (!doc) {
    return (
      <ErrorScreen
        title="Assignment Not Found"
        message={`The assignment with ID &quot;${id}&quot; does not exist.`}
      />
    );
  }

  // 3. Log successful fetch (helps with debugging)
  console.log(
    `[Server] Loaded document ${id} with ${(doc.content || []).length} blocks`
  );

  // 4. Pass the data to the client wrapper for hydration
  // The initialBlocks array is serialized to JSON and sent in the HTML
  // The client immediately hydrates the Zustand store with this data
  return (
    <ClientEditorWrapper
      initialBlocks={doc.content || []}
      docId={doc.id}
    />
  );
}
