// Define the clause mapping type
type ClauseMapping = {
  evidence: string;
  relevance: number;
  clause_number: string;
  potential_gaps: string;
};

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
