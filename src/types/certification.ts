export type Certification = {
    id: string
    created_at: string
    updated_at: string
    is_active: boolean
    name: string
    standard: string
    progress?: number
    controls?: number
    total?: number
    certified?: boolean
}

