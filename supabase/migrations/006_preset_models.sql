-- Tabela de modelos pré-definidos do sistema
CREATE TABLE preset_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,           -- Ex: "Ana - Jovem Branca"
  slug VARCHAR(50) UNIQUE NOT NULL,     -- Ex: "ana-jovem-branca"
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('female', 'male')),
  ethnicity VARCHAR(20) NOT NULL CHECK (ethnicity IN ('white', 'black')),
  body_type VARCHAR(20) NOT NULL CHECK (body_type IN ('slim', 'plus')),
  age_group VARCHAR(20) NOT NULL CHECK (age_group IN ('young', 'mature')),
  age_range VARCHAR(20) NOT NULL,       -- Ex: "20-30" ou "50-65"
  reference_url TEXT,                   -- URL da foto no Supabase Storage
  thumbnail_url TEXT,                   -- URL do thumbnail (menor)
  prompt_used TEXT,                     -- Prompt que gerou a foto
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: qualquer usuário autenticado pode ler
ALTER TABLE preset_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preset_models_read_all" ON preset_models
  FOR SELECT TO authenticated USING (is_active = true);

-- Apenas service_role pode inserir/atualizar
CREATE POLICY "preset_models_service_all" ON preset_models
  FOR ALL TO service_role USING (true);

-- Índices
CREATE INDEX idx_preset_models_active ON preset_models (is_active, sort_order);
CREATE INDEX idx_preset_models_filters ON preset_models (gender, ethnicity, body_type, age_group);

-- Insere os 24 registros (sem reference_url ainda — será preenchida após geração)
INSERT INTO preset_models (name, slug, gender, ethnicity, body_type, age_group, age_range, sort_order) VALUES
-- Mulheres brancas magras jovens
('Camila', 'camila', 'female', 'white', 'slim', 'young', '20-30', 1),
('Beatriz', 'beatriz', 'female', 'white', 'slim', 'young', '20-30', 2),
-- Mulheres negras magras jovens
('Jéssica', 'jessica', 'female', 'black', 'slim', 'young', '20-30', 3),
('Aline', 'aline', 'female', 'black', 'slim', 'young', '20-30', 4),
-- Mulheres brancas plus size jovens
('Fernanda', 'fernanda', 'female', 'white', 'plus', 'young', '20-30', 5),
('Larissa', 'larissa', 'female', 'white', 'plus', 'young', '20-30', 6),
-- Mulheres negras plus size jovens
('Bruna', 'bruna', 'female', 'black', 'plus', 'young', '20-30', 7),
('Tatiane', 'tatiane', 'female', 'black', 'plus', 'young', '20-30', 8),
-- Mulheres brancas magras maduras
('Sandra', 'sandra', 'female', 'white', 'slim', 'mature', '50-65', 9),
('Márcia', 'marcia', 'female', 'white', 'slim', 'mature', '50-65', 10),
-- Mulheres negras magras maduras
('Rosângela', 'rosangela', 'female', 'black', 'slim', 'mature', '50-65', 11),
('Conceição', 'conceicao', 'female', 'black', 'slim', 'mature', '50-65', 12),
-- Homens brancos magros jovens
('Gabriel', 'gabriel', 'male', 'white', 'slim', 'young', '20-30', 13),
('Rafael', 'rafael', 'male', 'white', 'slim', 'young', '20-30', 14),
-- Homens negros magros jovens
('Matheus', 'matheus', 'male', 'black', 'slim', 'young', '20-30', 15),
('Diego', 'diego', 'male', 'black', 'slim', 'young', '20-30', 16),
-- Homens brancos plus size jovens
('Bruno', 'bruno', 'male', 'white', 'plus', 'young', '20-30', 17),
('Rodrigo', 'rodrigo', 'male', 'white', 'plus', 'young', '20-30', 18),
-- Homens negros plus size jovens
('Anderson', 'anderson', 'male', 'black', 'plus', 'young', '20-30', 19),
('Leandro', 'leandro', 'male', 'black', 'plus', 'young', '20-30', 20),
-- Homens brancos magros maduros
('Carlos', 'carlos', 'male', 'white', 'slim', 'mature', '50-65', 21),
('Paulo', 'paulo', 'male', 'white', 'slim', 'mature', '50-65', 22),
-- Homens negros magros maduros
('Antônio', 'antonio', 'male', 'black', 'slim', 'mature', '50-65', 23),
('Benedito', 'benedito', 'male', 'black', 'slim', 'mature', '50-65', 24);
