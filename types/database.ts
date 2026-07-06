export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          created_at: string | null;
          entity_id: string | null;
          entity_type: Database["public"]["Enums"]["bookmark_entity_type"];
          id: string;
          item_ref: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          entity_id?: string | null;
          entity_type: Database["public"]["Enums"]["bookmark_entity_type"];
          id?: string;
          item_ref?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          entity_id?: string | null;
          entity_type?: Database["public"]["Enums"]["bookmark_entity_type"];
          id?: string;
          item_ref?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          order_index: number | null;
          subject_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          order_index?: number | null;
          subject_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          order_index?: number | null;
          subject_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          }
        ];
      };
      mock_exam_attempts: {
        Row: {
          created_at: string | null;
          id: string;
          score_data: Json;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          score_data: Json;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          score_data?: Json;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mock_exam_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          settings: Json | null;
          streak: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id: string;
          settings?: Json | null;
          streak?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          settings?: Json | null;
          streak?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          answer: string;
          choices: Json | null;
          content: string;
          created_at: string | null;
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null;
          explanation: string | null;
          id: string;
          subtopic_id: string | null;
          tags: string[] | null;
          topic_id: string | null;
          type: Database["public"]["Enums"]["question_type"];
        };
        Insert: {
          answer: string;
          choices?: Json | null;
          content: string;
          created_at?: string | null;
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null;
          explanation?: string | null;
          id?: string;
          subtopic_id?: string | null;
          tags?: string[] | null;
          topic_id?: string | null;
          type: Database["public"]["Enums"]["question_type"];
        };
        Update: {
          answer?: string;
          choices?: Json | null;
          content?: string;
          created_at?: string | null;
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null;
          explanation?: string | null;
          id?: string;
          subtopic_id?: string | null;
          tags?: string[] | null;
          topic_id?: string | null;
          type?: Database["public"]["Enums"]["question_type"];
        };
        Relationships: [
          {
            foreignKeyName: "questions_subtopic_id_fkey";
            columns: ["subtopic_id"];
            isOneToOne: false;
            referencedRelation: "subtopics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "questions_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          }
        ];
      };
      quiz_attempts: {
        Row: {
          created_at: string | null;
          id: string;
          score: number;
          subtopic_id: string | null;
          topic_id: string | null;
          total: number;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          score: number;
          subtopic_id?: string | null;
          topic_id?: string | null;
          total: number;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          score?: number;
          subtopic_id?: string | null;
          topic_id?: string | null;
          total?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_subtopic_id_fkey";
            columns: ["subtopic_id"];
            isOneToOne: false;
            referencedRelation: "subtopics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_attempts_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      subjects: {
        Row: {
          created_at: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      subtopics: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          order_index: number | null;
          topic_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          order_index?: number | null;
          topic_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          order_index?: number | null;
          topic_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subtopics_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          }
        ];
      };
      topic_resources: {
        Row: {
          common_mistakes: Json | null;
          created_at: string | null;
          external_links: Json | null;
          formulas: Json | null;
          id: string;
          key_concepts: Json | null;
          learning_objectives: Json | null;
          study_notes: string | null;
          subtopic_id: string | null;
          topic_id: string | null;
          updated_at: string | null;
          videos: Json | null;
        };
        Insert: {
          common_mistakes?: Json | null;
          created_at?: string | null;
          external_links?: Json | null;
          formulas?: Json | null;
          id?: string;
          key_concepts?: Json | null;
          learning_objectives?: Json | null;
          study_notes?: string | null;
          subtopic_id?: string | null;
          topic_id?: string | null;
          updated_at?: string | null;
          videos?: Json | null;
        };
        Update: {
          common_mistakes?: Json | null;
          created_at?: string | null;
          external_links?: Json | null;
          formulas?: Json | null;
          id?: string;
          key_concepts?: Json | null;
          learning_objectives?: Json | null;
          study_notes?: string | null;
          subtopic_id?: string | null;
          topic_id?: string | null;
          updated_at?: string | null;
          videos?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "topic_resources_subtopic_id_fkey";
            columns: ["subtopic_id"];
            isOneToOne: false;
            referencedRelation: "subtopics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "topic_resources_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          }
        ];
      };
      topics: {
        Row: {
          category_id: string;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          order_index: number | null;
        };
        Insert: {
          category_id: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          order_index?: number | null;
        };
        Update: {
          category_id?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          order_index?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "topics_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      user_cards: {
        Row: {
          created_at: string | null;
          ease_factor: number;
          id: string;
          interval: number;
          next_review: string;
          question_id: string;
          repetitions: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          ease_factor?: number;
          id?: string;
          interval?: number;
          next_review?: string;
          question_id: string;
          repetitions?: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          ease_factor?: number;
          id?: string;
          interval?: number;
          next_review?: string;
          question_id?: string;
          repetitions?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_cards_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_cards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_notes: {
        Row: {
          content: string;
          created_at: string | null;
          id: string;
          subtopic_id: string | null;
          topic_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: string;
          subtopic_id?: string | null;
          topic_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: string;
          subtopic_id?: string | null;
          topic_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_notes_subtopic_id_fkey";
            columns: ["subtopic_id"];
            isOneToOne: false;
            referencedRelation: "subtopics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_notes_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_notes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_progress: {
        Row: {
          created_at: string | null;
          id: string;
          status: Database["public"]["Enums"]["progress_status"] | null;
          study_time_seconds: number | null;
          subtopic_id: string | null;
          topic_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["progress_status"] | null;
          study_time_seconds?: number | null;
          subtopic_id?: string | null;
          topic_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["progress_status"] | null;
          study_time_seconds?: number | null;
          subtopic_id?: string | null;
          topic_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_progress_subtopic_id_fkey";
            columns: ["subtopic_id"];
            isOneToOne: false;
            referencedRelation: "subtopics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_progress_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      bookmark_entity_type: "topic" | "subtopic" | "resource" | "video" | "formula";
      difficulty_level: "easy" | "medium" | "hard";
      progress_status: "started" | "completed";
      question_type: "mcq" | "flashcard";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
