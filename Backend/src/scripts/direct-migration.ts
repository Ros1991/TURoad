import { AppDataSource } from '@/config/database';

async function executeDirectMigration() {
  try {
    console.log('🔄 Inicializando conexão com o banco...');
    await AppDataSource.initialize();
    
    const queryRunner = AppDataSource.createQueryRunner();
    
    console.log('🔍 Verificando estrutura atual da tabela events...');
    const currentColumns = await queryRunner.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('Colunas atuais:', currentColumns);
    
    // Verifica se event_time existe
    const hasEventTime = currentColumns.some((col: any) => col.column_name === 'event_time');
    const hasTimeTextRefId = currentColumns.some((col: any) => col.column_name === 'time_text_ref_id');
    
    if (hasEventTime && !hasTimeTextRefId) {
      console.log('🔄 Executando migration: removendo event_time e adicionando time_text_ref_id...');
      
      // Remove a coluna event_time
      await queryRunner.query('ALTER TABLE events DROP COLUMN IF EXISTS event_time');
      console.log('✅ Coluna event_time removida');
      
      // Adiciona a nova coluna time_text_ref_id
      await queryRunner.query(`
        ALTER TABLE events 
        ADD COLUMN time_text_ref_id INTEGER
      `);
      console.log('✅ Coluna time_text_ref_id adicionada');
      
      // Adiciona foreign key constraint
      await queryRunner.query(`
        ALTER TABLE events 
        ADD CONSTRAINT FK_events_time_text_ref_id 
        FOREIGN KEY (time_text_ref_id) 
        REFERENCES localized_texts(text_ref_id) 
        ON DELETE SET NULL
      `);
      console.log('✅ Foreign key constraint adicionada');
      
      // Registra a migration como executada
      await queryRunner.query(`
        INSERT INTO migrations (timestamp, name) 
        VALUES (1724348933000, 'AlterEventTimeToTranslatable1724348933000')
        ON CONFLICT DO NOTHING
      `);
      console.log('✅ Migration registrada na tabela migrations');
      
    } else if (!hasEventTime && hasTimeTextRefId) {
      console.log('✅ Migration já foi executada anteriormente');
    } else {
      console.log('⚠️ Estado inesperado da tabela events');
    }
    
    // Verifica o estado final
    console.log('🔍 Verificando estado final...');
    const finalColumns = await queryRunner.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('Colunas finais:', finalColumns);
    
    await queryRunner.release();
    
  } catch (error) {
    console.error('❌ Erro ao executar migration direta:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

executeDirectMigration();
