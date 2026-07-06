export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          settings: Json;
          streak: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          settings?: Json;
          streak?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          settings?: Json;
          streak?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: never[];
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: never[];
      };
      topics: {
        Row: {
          id: string;
          subject_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: never[];
      };
      questions: {
        Row: {
          id: string;
          topic_id: string;
          type: "mcq" | "flashcard";
          content: string;
          answer: string;
          explanation: string | null;
          choices: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          type: "mcq" | "flashcard";
          content: string;
          answer: string;
          explanation?: string | null;
          choices?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          type?: "mcq" | "flashcard";
          content?: string;
          answer?: string;
          explanation?: string | null;
          choices?: Json | null;
          created_at?: string;
        };
        Relationships: never[];
      };
      user_cards: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          interval: number;
          ease_factor: number;
          next_review: string;
          repetitions: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          interval?: number;
          ease_factor?: number;
          next_review?: string;
          repetitions?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          interval?: number;
          ease_factor?: number;
          next_review?: string;
          repetitions?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: never[];
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          topic_id: string;
          score: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          topic_id: string;
          score: number;
          total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          topic_id?: string;
          score?: number;
          total?: number;
          created_at?: string;
        };
        Relationships: never[];
      };
      mock_exam_attempts: {
        Row: {
          id: string;
          user_id: string;
          score_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score_data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          score_data?: Json;
          created_at?: string;
        };
        Relationships: never[];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
