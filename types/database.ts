export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string | null
          description: string
          icon: string | null
          id: string
          name: string
          points: number | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          name: string
          points?: number | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          name?: string
          points?: number | null
          slug?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: Database["public"]["Enums"]["bookmark_entity_type"]
          id: string
          item_ref: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type: Database["public"]["Enums"]["bookmark_entity_type"]
          id?: string
          item_ref?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: Database["public"]["Enums"]["bookmark_entity_type"]
          id?: string
          item_ref?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_index: number | null
          subject_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          subject_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_exam_attempts: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          score_data: Json | null
          state: Json | null
          status: Database["public"]["Enums"]["exam_status"] | null
          user_id: string
          version: number | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          score_data?: Json | null
          state?: Json | null
          status?: Database["public"]["Enums"]["exam_status"] | null
          user_id: string
          version?: number | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          score_data?: Json | null
          state?: Json | null
          status?: Database["public"]["Enums"]["exam_status"] | null
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mock_exam_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auto_continue: boolean | null
          auto_reveal: boolean | null
          created_at: string | null
          daily_new_cards_limit: number | null
          daily_review_limit: number | null
          email: string
          export_format: string | null
          id: string
          keyboard_shortcuts: boolean | null
          last_streak_freeze_used: string | null
          max_session_length: number | null
          reminder_time: string | null
          review_animations: boolean | null
          settings: Json | null
          sound_effects: boolean | null
          streak: number | null
          streak_frozen_until: string | null
          total_points: number | null
          updated_at: string | null
          weekend_reminders: boolean | null
        }
        Insert: {
          auto_continue?: boolean | null
          auto_reveal?: boolean | null
          created_at?: string | null
          daily_new_cards_limit?: number | null
          daily_review_limit?: number | null
          email: string
          export_format?: string | null
          id: string
          keyboard_shortcuts?: boolean | null
          last_streak_freeze_used?: string | null
          max_session_length?: number | null
          reminder_time?: string | null
          review_animations?: boolean | null
          settings?: Json | null
          sound_effects?: boolean | null
          streak?: number | null
          streak_frozen_until?: string | null
          total_points?: number | null
          updated_at?: string | null
          weekend_reminders?: boolean | null
        }
        Update: {
          auto_continue?: boolean | null
          auto_reveal?: boolean | null
          created_at?: string | null
          daily_new_cards_limit?: number | null
          daily_review_limit?: number | null
          email?: string
          export_format?: string | null
          id?: string
          keyboard_shortcuts?: boolean | null
          last_streak_freeze_used?: string | null
          max_session_length?: number | null
          reminder_time?: string | null
          review_animations?: boolean | null
          settings?: Json | null
          sound_effects?: boolean | null
          streak?: number | null
          streak_frozen_until?: string | null
          total_points?: number | null
          updated_at?: string | null
          weekend_reminders?: boolean | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string
          category_id: string | null
          choices: Json | null
          content: string
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          estimated_time_seconds: number | null
          exam_type: string[] | null
          explanation: string | null
          hint: string | null
          id: string
          source_type: string | null
          subject_id: string | null
          subtopic_id: string | null
          tags: string[] | null
          topic_id: string | null
          type: Database["public"]["Enums"]["question_type"]
          random_weight: number | null
        }
        Insert: {
          answer: string
          category_id?: string | null
          choices?: Json | null
          content: string
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          estimated_time_seconds?: number | null
          exam_type?: string[] | null
          explanation?: string | null
          hint?: string | null
          id?: string
          source_type?: string | null
          subject_id?: string | null
          subtopic_id?: string | null
          tags?: string[] | null
          topic_id?: string | null
          type: Database["public"]["Enums"]["question_type"]
          random_weight?: number | null
        }
        Update: {
          answer?: string
          category_id?: string | null
          choices?: Json | null
          content?: string
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          estimated_time_seconds?: number | null
          exam_type?: string[] | null
          explanation?: string | null
          hint?: string | null
          id?: string
          source_type?: string | null
          subject_id?: string | null
          subtopic_id?: string | null
          tags?: string[] | null
          topic_id?: string | null
          type?: Database["public"]["Enums"]["question_type"]
          random_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          score: number
          subtopic_id: string | null
          topic_id: string | null
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          score: number
          subtopic_id?: string | null
          topic_id?: string | null
          total: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          score?: number
          subtopic_id?: string | null
          topic_id?: string | null
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_history: {
        Row: {
          ease_factor: number
          id: string
          interval_days: number
          question_id: string
          rating: string
          response_time_seconds: number
          reviewed_at: string
          user_id: string
        }
        Insert: {
          ease_factor: number
          id?: string
          interval_days: number
          question_id: string
          rating: string
          response_time_seconds: number
          reviewed_at?: string
          user_id: string
        }
        Update: {
          ease_factor?: number
          id?: string
          interval_days?: number
          question_id?: string
          rating?: string
          response_time_seconds?: number
          reviewed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_history_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      subtopics: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_index: number | null
          topic_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          topic_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtopics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_resources: {
        Row: {
          common_mistakes: Json | null
          created_at: string | null
          external_links: Json | null
          formulas: Json | null
          id: string
          key_concepts: Json | null
          learning_objectives: Json | null
          study_notes: string | null
          subtopic_id: string | null
          topic_id: string | null
          updated_at: string | null
          videos: Json | null
        }
        Insert: {
          common_mistakes?: Json | null
          created_at?: string | null
          external_links?: Json | null
          formulas?: Json | null
          id?: string
          key_concepts?: Json | null
          learning_objectives?: Json | null
          study_notes?: string | null
          subtopic_id?: string | null
          topic_id?: string | null
          updated_at?: string | null
          videos?: Json | null
        }
        Update: {
          common_mistakes?: Json | null
          created_at?: string | null
          external_links?: Json | null
          formulas?: Json | null
          id?: string
          key_concepts?: Json | null
          learning_objectives?: Json | null
          study_notes?: string | null
          subtopic_id?: string | null
          topic_id?: string | null
          updated_at?: string | null
          videos?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "topic_resources_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_resources_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_index: number | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          id: string
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          id?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          id?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cards: {
        Row: {
          average_response_time: number
          created_at: string | null
          ease_factor: number
          id: string
          interval: number
          lapse_count: number
          last_review: string | null
          mastery_score: number
          next_review: string
          question_id: string
          repetitions: number
          retention_score: number
          state: Database["public"]["Enums"]["card_state"]
          total_reviews: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_response_time?: number
          created_at?: string | null
          ease_factor?: number
          id?: string
          interval?: number
          lapse_count?: number
          last_review?: string | null
          mastery_score?: number
          next_review?: string
          question_id: string
          repetitions?: number
          retention_score?: number
          state?: Database["public"]["Enums"]["card_state"]
          total_reviews?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_response_time?: number
          created_at?: string | null
          ease_factor?: number
          id?: string
          interval?: number
          lapse_count?: number
          last_review?: string | null
          mastery_score?: number
          next_review?: string
          question_id?: string
          repetitions?: number
          retention_score?: number
          state?: Database["public"]["Enums"]["card_state"]
          total_reviews?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cards_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          subtopic_id: string | null
          topic_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          subtopic_id?: string | null
          topic_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          subtopic_id?: string | null
          topic_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notes_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["progress_status"] | null
          study_time_seconds: number | null
          subtopic_id: string | null
          topic_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["progress_status"] | null
          study_time_seconds?: number | null
          subtopic_id?: string | null
          topic_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["progress_status"] | null
          study_time_seconds?: number | null
          subtopic_id?: string | null
          topic_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp_history: {
        Row: {
          id: string
          user_id: string | null
          action_type: string
          xp_awarded: number
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          action_type?: string
          xp_awarded?: number
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          action_type?: string
          xp_awarded?: number
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
      missions: {
        Row: {
          id: string
          title: string
          description: string
          mission_type: string
          target_count: number
          xp_reward: number
          action_type: string
          created_at: string | null
        }
        Insert: {
          id?: string
          title?: string
          description?: string
          mission_type?: string
          target_count?: number
          xp_reward?: number
          action_type?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          mission_type?: string
          target_count?: number
          xp_reward?: number
          action_type?: string
          created_at?: string | null
        }
        Relationships: []
      }
      user_missions: {
        Row: {
          id: string
          user_id: string | null
          mission_id: string | null
          current_progress: number | null
          is_completed: boolean | null
          expires_at: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          mission_id?: string | null
          current_progress?: number | null
          is_completed?: boolean | null
          expires_at?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          mission_id?: string | null
          current_progress?: number | null
          is_completed?: boolean | null
          expires_at?: string
          created_at?: string | null
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          id: string
          name: string
          description: string | null
          level: number
          created_at: string | null
        }
        Insert: {
          id?: string
          name?: string
          description?: string | null
          level?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          level?: number
          created_at?: string | null
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          id: string
          role_id: string | null
          resource: string
          action: string
          created_at: string | null
        }
        Insert: {
          id?: string
          role_id?: string | null
          resource?: string
          action?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          role_id?: string | null
          resource?: string
          action?: string
          created_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string | null
          role_id: string | null
          assigned_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          role_id?: string | null
          assigned_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          role_id?: string | null
          assigned_by?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          resource: string
          resource_id: string | null
          old_value: Json | null
          new_value: Json | null
          ip_address: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          admin_id?: string | null
          action?: string
          resource?: string
          resource_id?: string | null
          old_value?: Json | null
          new_value?: Json | null
          ip_address?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          admin_id?: string | null
          action?: string
          resource?: string
          resource_id?: string | null
          old_value?: Json | null
          new_value?: Json | null
          ip_address?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          id: string
          reporter_id: string | null
          resource_type: string
          resource_id: string
          reason: string
          description: string | null
          status: string | null
          resolved_by: string | null
          resolved_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          reporter_id?: string | null
          resource_type?: string
          resource_id?: string
          reason?: string
          description?: string | null
          status?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          reporter_id?: string | null
          resource_type?: string
          resource_id?: string
          reason?: string
          description?: string | null
          status?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          id: string
          key: string
          name: string
          is_enabled: boolean | null
          description: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          key?: string
          name?: string
          is_enabled?: boolean | null
          description?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          key?: string
          name?: string
          is_enabled?: boolean | null
          description?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      platform_announcements: {
        Row: {
          id: string
          title: string
          content: string
          type: string | null
          is_active: boolean | null
          target_audience: string | null
          created_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title?: string
          content?: string
          type?: string | null
          is_active?: boolean | null
          target_audience?: string | null
          created_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: string | null
          is_active?: boolean | null
          target_audience?: string | null
          created_by?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      ai_generations: {
        Row: {
          id: string
          generator_id: string | null
          prompt: string
          provider: string
          model: string
          parameters: Json | null
          output: Json
          quality_score: number | null
          processing_time_ms: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          generator_id?: string | null
          prompt?: string
          provider?: string
          model?: string
          parameters?: Json | null
          output?: Json
          quality_score?: number | null
          processing_time_ms?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          generator_id?: string | null
          prompt?: string
          provider?: string
          model?: string
          parameters?: Json | null
          output?: Json
          quality_score?: number | null
          processing_time_ms?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          id: string
          resource_type: string
          resource_id: string
          version_number: number
          data: Json
          author_id: string | null
          commit_message: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          resource_type?: string
          resource_id?: string
          version_number?: number
          data?: Json
          author_id?: string | null
          commit_message?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          resource_type?: string
          resource_id?: string
          version_number?: number
          data?: Json
          author_id?: string | null
          commit_message?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      media_resources: {
        Row: {
          id: string
          type: string
          url: string | null
          title: string | null
          metadata: Json | null
          status: string | null
          transcript: string | null
          summary: string | null
          uploaded_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          type?: string
          url?: string | null
          title?: string | null
          metadata?: Json | null
          status?: string | null
          transcript?: string | null
          summary?: string | null
          uploaded_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          url?: string | null
          title?: string | null
          metadata?: Json | null
          status?: string | null
          transcript?: string | null
          summary?: string | null
          uploaded_by?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      content_health: {
        Row: {
          id: string
          subject_id: string | null
          topic_id: string | null
          total_questions: number | null
          draft_questions: number | null
          published_questions: number | null
          average_quality_score: string | null
          duplicate_risk_count: number | null
          last_analyzed_at: string | null
        }
        Insert: {
          id?: string
          subject_id?: string | null
          topic_id?: string | null
          total_questions?: number | null
          draft_questions?: number | null
          published_questions?: number | null
          average_quality_score?: string | null
          duplicate_risk_count?: number | null
          last_analyzed_at?: string | null
        }
        Update: {
          id?: string
          subject_id?: string | null
          topic_id?: string | null
          total_questions?: number | null
          draft_questions?: number | null
          published_questions?: number | null
          average_quality_score?: string | null
          duplicate_risk_count?: number | null
          last_analyzed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      subject_mastery_analytics_view: {
        Row: {
          avg_retention: number | null
          mastered_cards: number | null
          mastery_percentage: number | null
          subject_id: string | null
          total_cards: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_mastery_view: {
        Row: {
          avg_retention: number | null
          mastered_cards: number | null
          mastery_percentage: number | null
          topic_id: string | null
          subject_id: string | null
          total_cards: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_scalable_random_questions: {
        Args: {
          p_topic_id?: string | null
          p_subject_id?: string | null
          p_category_id?: string | null
          p_difficulty?: string | null
          p_seed?: number
          p_limit: number
        }
        Returns: {
          id: string
          content: string
          choices: Json
          explanation: string
          type: string
          difficulty: string
          topic_id: string
          subject_id: string
        }[]
      }
      update_exam_state: {
        Args: {
          p_attempt_id: string
          p_user_id: string
          p_expected_version: number
          p_new_answers: Json
          p_new_flagged: Json
          p_new_time_per_question: Json
          p_remaining_seconds: number
        }
        Returns: number
      }
    }
    Enums: {
      bookmark_entity_type:
        | "topic"
        | "subtopic"
        | "resource"
        | "video"
        | "formula"
      card_state:
        | "new"
        | "learning"
        | "review"
        | "relearning"
        | "suspended"
        | "buried"
      difficulty_level: "easy" | "medium" | "hard" | "challenge"
      exam_status: "in_progress" | "completed" | "abandoned"
      progress_status: "started" | "completed"
      question_type: "mcq" | "flashcard"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      bookmark_entity_type: [
        "topic",
        "subtopic",
        "resource",
        "video",
        "formula",
      ],
      card_state: [
        "new",
        "learning",
        "review",
        "relearning",
        "suspended",
        "buried",
      ],
      difficulty_level: ["easy", "medium", "hard", "challenge"],
      exam_status: ["in_progress", "completed", "abandoned"],
      progress_status: ["started", "completed"],
      question_type: ["mcq", "flashcard"],
    },
  },
} as const
