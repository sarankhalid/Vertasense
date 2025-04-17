// Define the clause mapping type
type ClauseMapping = {
  evidence: string;
  relevance: number;
  clause_number: string;
  potential_gaps: string;
};

/**
 * UserDocument interface - Represents the database schema for user_documents table
 */
export interface UserDocument {
  id: string;                      // UUID
  client_certificate_id: string;   // UUID
  vector_store_id: string;         // Text
  created_at: string;              // Timestamp with time zone
  updated_at: string;              // Timestamp with time zone
  documents_tags: {                // JSONB
    rationale: string;
    confidence: number;
    document_name: string;
    document_types: string[];
  } | null;
  mapped_clauses: {                // JSONB
    file_name: string;
    clause_mappings: ClauseMapping[] | ClauseMapping; // Can be an array or a single object
  } | null;
  name: string;                    // Character varying
  size: number;                    // Bigint
  file_id: string;                 // Text - OpenAI file ID in format file-XXXX
  type: string;                    // Character varying
  extension: string;               // Character varying
  path: string;                    // Text
  processing_status: string;       // Character varying
  error: string | null;            // Text - Stores error information when document processing fails
}

/**
 * Document type - Used for frontend representation of documents
 */
export type Document = {
  id: string;
  title: string;
  type: string;
  isAiClassified?: boolean;
  clauses?: string[];
  certificate?: string;
  status?: string;
  version?: string;
  lastUpdated?: string;
  owner?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt?: string;
  certificateId?: string;
  processing_status?: string;
  extension?: string; // File extension (e.g., ".pdf", ".docx")
  documents_tags?: {
    rationale: string;
    confidence: number;
    document_name: string;
    document_types: string[];
  };
  mapped_clauses?: {
    file_name: string;
    clause_mappings: ClauseMapping[] | ClauseMapping; // Can be an array or a single object
  };
};
