import { AppDataSource } from '@/config/database';
import { AlterEventTimeToTranslatable1724348933000 } from '@/database/migrations/1724348933000-AlterEventTimeToTranslatable';

async function runMigration() {
  try {
    console.log('🔄 Inicializando conexão com o banco...');
    await AppDataSource.initialize();
    
    console.log('🔄 Executando migration AlterEventTimeToTranslatable...');
    const migration = new AlterEventTimeToTranslatable1724348933000();
    await migration.up(AppDataSource.createQueryRunner());
    
    console.log('✅ Migration executada com sucesso!');
    console.log('- Coluna event_time removida');
    console.log('- Coluna time_text_ref_id adicionada');
    console.log('- Foreign key constraint adicionada');
    
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

runMigration();
