import { Canvas } from '@/components/editor/Canvas';
import { SyncProvider } from '@/components/providers/SyncProvider';

/**
 * Home Page - Glass Box Editor
 * 
 * This is the main editor interface. It demonstrates:
 * 1. SyncProvider wrapping the Canvas (sync happens passively in background)
 * 2. Canvas rendering editable blocks
 * 3. Full integration of the block-based editor system
 * 
 * Architecture:
 * - SyncProvider: Watches Zustand store and syncs to Supabase every 10 seconds
 * - Canvas: Renders contentEditable blocks and handles user input
 * 
 * In production, you'd:
 * - Make this route protected (auth check for current user)
 * - Load docId from URL params or navigation state
 * - Create/validate the document in Supabase before rendering
 * - Implement document list/picker UI
 * 
 * For local development/testing:
 * - The docId is hardcoded, but change it to your actual Supabase document ID
 * - Create a test document in Supabase documents table first
 * - Verify your Supabase URL and anon key in .env.local
 */
export default function Home() {
  // In a real app, this would come from:
  // - Server component params: const { id } = params
  // - Client-side router: const { id } = useParams()
  // - A database query: const doc = await getDocument(id)
  //
  // For demo/testing: use a test document ID
  // TODO: Change this to a real document ID from your database
  const docId = 'demo-document-id';

  return (
    <SyncProvider docId={docId}>
      <Canvas />
    </SyncProvider>
  );
}
