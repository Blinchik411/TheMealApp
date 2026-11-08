export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface LocalizedText {
  en: string;
  ru: string;
}

export interface MealDietary {
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
}

export interface MealNutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface MealStep {
  stepNumber: number;
  instruction: LocalizedText;
  timerMinutes: number | null;
}

export interface MealIngredient {
  ingredient: LocalizedText | string;
  measure: LocalizedText | string;
  imageUrl?: string;
}

export interface MealTags {
  en: string[];
  ru: string[];
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      areas: {
        Row: {
          count: number | null;
          name: LocalizedText;
          slug: string;
        };
        Insert: {
          count?: number | null;
          name: LocalizedText;
          slug: string;
        };
        Update: {
          count?: number | null;
          name?: LocalizedText;
          slug?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          count: number | null;
          description: LocalizedText;
          id: string;
          image_url: string;
          name: LocalizedText;
          slug: string;
        };
        Insert: {
          count?: number | null;
          description: LocalizedText;
          id: string;
          image_url: string;
          name: LocalizedText;
          slug: string;
        };
        Update: {
          count?: number | null;
          description?: LocalizedText;
          id?: string;
          image_url?: string;
          name?: LocalizedText;
          slug?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          category: string | null;
          created_at: string;
          cuisine: string | null;
          id: number;
          meal_id: string;
          meal_thumb: string;
          meal_title: string;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          cuisine?: string | null;
          id?: number;
          meal_id: string;
          meal_thumb: string;
          meal_title: string;
          user_id: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          cuisine?: string | null;
          id?: number;
          meal_id?: string;
          meal_thumb?: string;
          meal_title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      meal_types: {
        Row: {
          count: number | null;
          id: string;
          name: LocalizedText;
        };
        Insert: {
          count?: number | null;
          id: string;
          name: LocalizedText;
        };
        Update: {
          count?: number | null;
          id?: string;
          name?: LocalizedText;
        };
        Relationships: [];
      };
      meals: {
        Row: {
          area: LocalizedText;
          category: LocalizedText;
          cook_time_minutes: number;
          created_at: string | null;
          date_modified: string | null;
          dietary: MealDietary;
          difficulty: 'easy' | 'medium' | 'hard';
          id: string;
          image_url: string;
          ingredients: MealIngredient[];
          instructions: LocalizedText | string;
          meal_type: string[];
          name: LocalizedText;
          nutrition: MealNutrition;
          prep_time_minutes: number;
          servings: number;
          slug: string;
          source_url: string | null;
          steps: MealStep[];
          tags: MealTags | string[];
          total_time_minutes: number;
          youtube_url: string | null;
        };
        Insert: {
          area: LocalizedText;
          category: LocalizedText;
          cook_time_minutes?: number;
          created_at?: string | null;
          date_modified?: string | null;
          dietary?: MealDietary;
          difficulty?: 'easy' | 'medium' | 'hard';
          id: string;
          image_url: string;
          ingredients?: MealIngredient[];
          instructions?: LocalizedText | string;
          meal_type?: string[];
          name: LocalizedText;
          nutrition?: MealNutrition;
          prep_time_minutes?: number;
          servings?: number;
          slug: string;
          source_url?: string | null;
          steps?: MealStep[];
          tags?: MealTags | string[];
          total_time_minutes?: number;
          youtube_url?: string | null;
        };
        Update: {
          area?: LocalizedText;
          category?: LocalizedText;
          cook_time_minutes?: number;
          created_at?: string | null;
          date_modified?: string | null;
          dietary?: MealDietary;
          difficulty?: 'easy' | 'medium' | 'hard';
          id?: string;
          image_url?: string;
          ingredients?: MealIngredient[];
          instructions?: LocalizedText | string;
          meal_type?: string[];
          name?: LocalizedText;
          nutrition?: MealNutrition;
          prep_time_minutes?: number;
          servings?: number;
          slug?: string;
          source_url?: string | null;
          steps?: MealStep[];
          tags?: MealTags | string[];
          total_time_minutes?: number;
          youtube_url?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { '': string }; Returns: string[] };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;
