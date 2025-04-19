import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-auth";

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();
    
    // Check if Supabase client is properly initialized
    if (!supabase) {
      return NextResponse.json({ error: "Supabase admin client is not initialized" }, { status: 500 });
    }
    
    // Get table information for chat_history table
    const { data: tableInfo, error: tableError } = await supabase
      .from('chat_history')
      .select('*')
      .limit(1);
      
    if (tableError) {
      return NextResponse.json({ 
        error: "Error fetching chat_history table info", 
        details: tableError 
      }, { status: 500 });
    }
    
    // Get column information
    let columnInfo = {};
    if (tableInfo && tableInfo.length > 0) {
      const sampleRow = tableInfo[0];
      columnInfo = Object.keys(sampleRow).reduce((acc, key) => {
        acc[key] = {
          exists: true,
          type: typeof sampleRow[key],
          value: sampleRow[key] === null ? 'null' : 'has value'
        };
        return acc;
      }, {});
    } else {
      // Try to get table structure if no rows exist
      const { data: structureData, error: structureError } = await supabase
        .rpc('get_table_structure', { table_name: 'chat_history' })
        .select('*');
        
      if (structureError) {
        return NextResponse.json({ 
          error: "Error fetching chat_history table structure", 
          details: structureError 
        }, { status: 500 });
      }
      
      columnInfo = structureData || {};
    }
    
    return NextResponse.json({
      status: "Database schema check",
      table: "chat_history",
      exists: true,
      columns: columnInfo,
      sampleRowCount: tableInfo?.length || 0
    });
  } catch (err) {
    return NextResponse.json({ 
      error: "Exception in check-chat-schema", 
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
