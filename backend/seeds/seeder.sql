-- シード: トピック + 全問題（Q1〜Q12）
-- idempotent（重複実行しても安全）

-- ── トピック ──────────────────────────────────────────────────────
INSERT INTO topics (id, name, description)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'AI基礎・最新動向',
  'RAG・LLM・AI Agentなど、AIエンジニアが押さえておくべき基礎知識と最新トレンド'
)
ON CONFLICT (id) DO NOTHING;


-- ── Q1: RAGのベクトル検索（ai_basics / 中級）────────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'RAG（Retrieval-Augmented Generation）において、外部知識を検索する際に一般的に使われる手法はどれか？',
  2, 'ai_basics'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'キーワードによる全文検索（BM25）のみ使用する',       false, 1),
  ('11000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'テキストをベクトル化し、コサイン類似度で近傍検索する', true,  2),
  ('11000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'SQLのLIKE句でデータベースを検索する',                 false, 3),
  ('11000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'LLM自身の記憶（パラメータ）だけを参照する',            false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000001',
  'RAGではテキストをEmbeddingモデルでベクトル化し、ベクトルDB（pgvector、Chroma、Pineconeなど）にコサイン類似度で近傍検索するのが主流。BM25との組み合わせ（ハイブリッド検索）も増えている。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q2: AI AgentのTool Use（ai_basics / 中級）───────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'LLMベースのAI Agentが「Tool Use（Function Calling）」を行う主な目的はどれか？',
  2, 'ai_basics'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('12000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'LLMのパラメータ数を増やしてモデルを強化するため',                   false, 1),
  ('12000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'LLM単体では実行できない外部API呼び出しや計算などを実現するため',     true,  2),
  ('12000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'プロンプトの文字数を削減してコストを下げるため',                     false, 3),
  ('12000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'モデルのファインチューニングを自動化するため',                       false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000002',
  'Tool UseによりLLMはWeb検索・コード実行・DB参照・外部APIなど「自分が持っていない能力」を獲得できる。Anthropicのtool_use、OpenAIのfunction callingが代表例。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q3: Transformer Self-Attention（ai_basics / 上級）───────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Transformerアーキテクチャの「Self-Attention」が解決した、従来のRNNの主な課題はどれか？',
  3, 'ai_basics'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('13000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'パラメータ数が多すぎてGPUメモリに乗らない問題',                             false, 1),
  ('13000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '長い文章で離れたトークン間の依存関係を捉えにくい問題（長距離依存）',         true,  2),
  ('13000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '学習データの前処理に時間がかかりすぎる問題',                               false, 3),
  ('13000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'テキスト以外のモダリティ（画像・音声）を扱えない問題',                       false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000003',
  'RNNは順番に処理するため、文の最初と最後など離れたトークン間の関係が薄れる（勾配消失）。Self-Attentionはすべてのトークンペアを並列で見るため長距離依存を効率よく学習できる。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q4: Fugaku-LLM（ai_services / 中級）──────────────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  '日本の国産LLM「Fugaku-LLM」を中心となって開発した機関はどれか？',
  2, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('14000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', '東京大学単独での開発',                                               false, 1),
  ('14000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', '富士通・理化学研究所を中心としたコンソーシアムによる開発（スパコン富岳を活用）', true, 2),
  ('14000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 'ソフトバンクとMeta社との共同開発',                                    false, 3),
  ('14000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '経済産業省が主導する政府プロジェクト単独での開発',                      false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000004',
  'Fugaku-LLMは富士通・理化学研究所・東大・東工大など9機関のコンソーシアムが、スーパーコンピュータ「富岳」を用いて開発した日本語特化の大規模言語モデル。2024年にApache 2.0ライセンスで公開された。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q5: NTT tsuzumi（ai_services / 中級）─────────────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'NTTが2024年に発表した日本語LLM「tsuzumi」の特徴として正しいものはどれか？',
  2, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('15000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'パラメータ数1,000億以上の超大規模モデルであり、GPT-4を上回る性能を持つ',    false, 1),
  ('15000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', '英語のみに特化しており、日本語処理は外部翻訳APIに依存している',             false, 2),
  ('15000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', '軽量（数十億パラメータ規模）ながら日本語・英語に強く、業界特化のファインチューニングを想定した設計', true, 3),
  ('15000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 'オープンソースとして無償公開され、誰でも商用利用できる',                    false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000005',
  'tsuzumiはNTTが開発した軽量日本語LLM（7Bおよび70Bモデル）。日本語と英語に強く、業界・企業ごとのファインチューニングを前提とした設計が特徴。NTTグループのサービスへの組み込みも進んでいる。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q6: LLM-jp / NII（ai_services / 中級）───────────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000001',
  '国立情報学研究所（NII）が中心となり、日本の大学・研究機関が共同で開発しているオープンな日本語LLMプロジェクトの名称はどれか？',
  2, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('16000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'Japanese Stable LM',   false, 1),
  ('16000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'LLM-jp',               true,  2),
  ('16000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'Swallow',              false, 3),
  ('16000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006', 'ELYZA-japanese-Llama', false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000006',
  'LLM-jpはNII（国立情報学研究所）が主導し、日本の大学・研究機関が参加するオープンなLLM開発プロジェクト。学習データの透明性を重視し、モデル・データセットをHugging Faceで公開している。Swallowは東工大、ELYZA-japanese-LlamaはELYZA社の別プロジェクト。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q7: ELYZA（ai_services / 中級）───────────────────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000001',
  'Llama 2/3をベースに日本語継続事前学習を行った「ELYZA-japanese-Llama」の開発元として正しいのはどれか？',
  2, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('17000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'NTTグループが開発し、社内サービスに展開している',                              false, 1),
  ('17000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 'ELYZA株式会社（現在はKDDIグループ傘下）が開発した',                             true,  2),
  ('17000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000007', '富士通と理化学研究所が共同開発した国産モデルである',                             false, 3),
  ('17000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000007', 'Stability AI Japanが公開したオープンソースモデルである',                        false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000007',
  'ELYZAは東京大学松尾研発のスタートアップが開発したLlama 2/3ベースの日本語LLM。2024年にKDDIに買収されKDDIグループ傘下となった。「ELYZA-japanese-Llama-2-7b」など複数のモデルをHugging Faceで公開している。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q8: Swallow（ai_services / 中級）─────────────────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000001',
  'LLaMAをベースに東京工業大学（東京科学大学）と産業技術総合研究所が開発した日本語継続事前学習モデルの名称はどれか？',
  2, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('18000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'CALM2',               false, 1),
  ('18000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', 'Swallow',             true,  2),
  ('18000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000008', 'Japanese Stable LM',  false, 3),
  ('18000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000008', 'Rinna',               false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000008',
  'Swallowは東京工業大学（2024年に東京科学大学へ改称）と産総研（AIST）が中心となり、LLaMAを日本語データで継続事前学習したモデル。Llama 2・3ベースのモデルをHugging Faceで公開しており、商用利用も可能。CALM2はサイバーエージェント、Rinnaは旧Microsoft子会社による別プロジェクト。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q9: SB Intuitions（ai_services / 中級）───────────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  'SoftBankが2024年に設立したAI子会社「SB Intuitions」の主な事業目的として正しいのはどれか？',
  2, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('19000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', '海外LLMの日本語翻訳・ローカライズサービスの提供',                              false, 1),
  ('19000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000009', 'GPUクラウドインフラの構築と外部への貸出のみ',                                   false, 2),
  ('19000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000009', '日本語に強い大規模言語モデルの自社開発・提供',                                  true,  3),
  ('19000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000009', 'チャットボットパッケージのSMB向け販売代理',                                     false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000009',
  'SB Intuitionsは2024年にSoftBankが設立したAI子会社で、国産の日本語LLM開発・提供を主軸とする。SoftBankグループのNVIDIA製GPU基盤を活用して大規模な事前学習を行い、日本語性能に優れたモデルの開発・商用展開を目指している。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q10: Japanese Stable LM（ai_services / 中級）─────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  '画像生成AIのStable Diffusionで知られるStability AI Japanが開発・公開している日本語LLMの名称はどれか？',
  2, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', 'Rinna',                  false, 1),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'Japanese Stable LM',     true,  2),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000010', 'CALM2',                  false, 3),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000010', 'Stockmark-LLM',          false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000010',
  'Japanese Stable LMはStability AI Japanが開発・公開する日本語LLMシリーズ。Stable Diffusionを擁するStability AI傘下の日本法人が手がけており、Apache 2.0ライセンスで公開されているモデルもある。Rinnaは旧Microsoft子会社のRinna社、CALM2はサイバーエージェントによる別プロジェクト。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q11: ハルシネーションの仕組み（ai_basics / 中級）────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'LLMがハルシネーション（幻覚）を起こす主な原因として、最も適切なものはどれか？',
  2, 'ai_basics'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('21000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', 'モデルのパラメータ数が多すぎて、記憶容量が溢れてしまうため', false, 1),
  ('21000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000011', '「次に来るトークンとして最もらしいもの」を確率的に予測する仕組みのため、事実確認をせずに文章を生成してしまう', true, 2),
  ('21000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000011', 'インターネットへのリアルタイムアクセスが遮断されているため、古い情報しか返せない', false, 3),
  ('21000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000011', '学習データに含まれていた誤情報をそのまま記憶・再現しているため', false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000011',
  'LLMは「次のトークンの確率分布」を予測する言語モデルであり、事実を検索・検証する機能を持たない。そのため、学習データにない情報であっても「文脈として自然な文章」を生成し続けてしまう（ハルシネーション）。これを緩和する手段として、外部知識を注入するRAGや、回答に根拠を求めるCitation付きプロンプト設計などが活用される。学習データの誤情報も一因にはなるが、ハルシネーションの本質的な原因は確率的生成の仕組みにある。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q12: CLAUDE.mdの役割（engineering / 初級）──────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000001',
  'Claude Codeにおいて「CLAUDE.md」ファイルの主な役割はどれか？',
  1, 'engineering'
)
ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, difficulty = EXCLUDED.difficulty;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('22000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', 'プロジェクトのCI/CDパイプラインを定義するファイル',                                                    false, 1),
  ('22000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000012', 'Claude Codeが会話開始時に自動読み込みする、プロジェクト固有の指示・コンテキストを記述するファイル', true,  2),
  ('22000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000012', 'TypeScriptの型定義を自動生成するための設定ファイル',                                                  false, 3),
  ('22000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000012', 'Gitのコミットメッセージテンプレートを定義するファイル',                                                false, 4)
ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, is_correct = EXCLUDED.is_correct;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000012',
  'CLAUDE.mdはClaude Codeが会話開始時に自動読み込みするプロジェクト指示ファイル。コーディング規約・技術スタック・禁止事項・ディレクトリ構成などを記述することで、毎回同じ指示をプロンプトに含める手間を省き、一貫した振る舞いを実現できる。グローバル（~/.claude/）・プロジェクトルート・サブディレクトリの3段階で適用範囲を制御できる。'
) ON CONFLICT (question_id) DO UPDATE SET text = EXCLUDED.text;


-- ── Q13: Chain-of-Thought プロンプティング（ai_basics / 中級）──────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000001',
  'Chain-of-Thought（CoT）プロンプティングの主な効果として正しいものはどれか？',
  2, 'ai_basics'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('23000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000013', 'LLMに「考える手順」を示すことで複雑な推論タスクの精度を向上させる',       true,  1),
  ('23000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000013', 'モデルのパラメータ数を自動的に増加させてモデルを強化する',                 false, 2),
  ('23000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000013', '入力トークン数を削減してAPIコストを下げる',                               false, 3),
  ('23000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000013', 'テキスト以外の画像・音声入力にも対応するマルチモーダル化を実現する',        false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000013',
  'Chain-of-Thoughtは「まずAを考え、次にBを考え、よってCである」のように思考ステップをプロンプトに含める手法。Wei et al. 2022が提唱し、算数・論理・常識推論などで大幅な精度向上が確認された。ステップを示す少数例を与えるFew-shot CoTと「Let''s think step by step」のみ加えるZero-shot CoTの2種類がある。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q14: RLHF（ai_basics / 上級）────────────────────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000014',
  '00000000-0000-0000-0000-000000000001',
  'RLHF（Reinforcement Learning from Human Feedback）を用いる主な目的はどれか？',
  3, 'ai_basics'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('24000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', 'モデルの出力を人間の価値観・意図に沿うよう調整するため',                   true,  1),
  ('24000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', '学習データのアノテーション作業を自動化して人件費を削減するため',             false, 2),
  ('24000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000014', 'GPUの並列計算を効率化してモデルの学習速度を高速化するため',                  false, 3),
  ('24000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000014', 'Transformerの自己注意機構を削除してモデルを軽量化するため',                 false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000014',
  'RLHFはSFT後のモデルに対し、人間のランカーが回答を評価した報酬モデルを用いて強化学習を行う手法。InstructGPT論文（Ouyang et al. 2022）で発表され、ChatGPT・Claude・Geminiなど主要LLMの訓練に採用されている。人間の好みを反映した回答を生成できるようになる一方、報酬モデルの品質や評価者のバイアスが結果に影響する課題もある。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q15: GPT-4の特徴（ai_services / 中級）────────────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000015',
  '00000000-0000-0000-0000-000000000001',
  'OpenAIが2023年3月に発表したGPT-4の特徴として正しいものはどれか？',
  2, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('25000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000015', 'マルチモーダル対応（テキスト＋画像入力）で、複雑な推論タスクでGPT-3.5を大きく上回る', true,  1),
  ('25000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000015', 'テキストのみ対応で、GPT-3.5と同等の性能だがコストが低い',                           false, 2),
  ('25000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000015', 'オープンソースとして公開され、誰でも重みをダウンロードできる',                         false, 3),
  ('25000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000015', '英語専用モデルで、日本語は公式にサポートされていない',                               false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000015',
  'GPT-4はOpenAIが2023年3月に発表したマルチモーダルLLM。司法試験・医師資格試験などのベンチマークでGPT-3.5を大幅に上回るスコアを記録。パラメータ数などの詳細は非公開。GPT-4 Turbo・GPT-4oなど派生モデルも公開されており、GPT-4oはテキスト・画像・音声をネイティブに処理できる。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q16: Meta Llama 3の特徴（ai_services / 中級）──────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000016',
  '00000000-0000-0000-0000-000000000001',
  'Metaが2024年4月に公開したLlama 3の特徴として正しいものはどれか？',
  2, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('26000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000016', 'オープンウェイトモデルとして公開され、商用利用も可能な8Bおよび70Bのモデルが提供された', true,  1),
  ('26000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000016', '商用利用禁止のクローズドソースモデルで、APIからのみアクセス可能',                     false, 2),
  ('26000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000016', '日本語特化の国産LLMとして日本の研究機関と共同開発された',                            false, 3),
  ('26000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000016', 'テキスト生成ではなく画像生成に特化したモデルとして設計された',                         false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000016',
  'Llama 3はMetaが2024年4月に公開したオープンウェイトLLM。8Bと70Bのモデルが公開され、多くのユースケースで商用利用が可能。ELYZAやSwallowなど日本のLLMプロジェクトのベースモデルとしても活用されている。後にLlama 3.1・3.2・3.3とシリーズが拡張され、マルチモーダル対応モデルも登場した。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q17: Google Geminiの特徴（ai_services / 初級）────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000017',
  '00000000-0000-0000-0000-000000000001',
  '2023年12月にGoogleが発表したマルチモーダルLLM「Gemini」の特徴として正しいものはどれか？',
  1, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('27000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000017', 'Ultra・Pro・Nanoの3サイズ展開で、テキスト・画像・音声・動画をネイティブに処理できるよう設計された', true,  1),
  ('27000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000017', 'テキストのみ対応で、画像・音声処理には別モデルが必要',                                           false, 2),
  ('27000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000017', 'Google検索エンジンをLLMに置き換える後継サービスとして開発された',                               false, 3),
  ('27000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000017', '日本語に対応しておらず、英語専用モデルとして提供されている',                                     false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000017',
  'Geminiは2023年12月にGoogleが発表したマルチモーダルLLM。Ultra・Pro・Nanoの3サイズが用意され、テキスト・画像・音声・動画・コードをネイティブに処理できるよう設計された。Google WorkspaceやAndroidにも統合されている。2024年にはGemini 1.5 Pro（100万トークンコンテキスト）、Gemini 2.0 Flashなども公開された。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q18: RAGによるハルシネーション低減（ai_basics / 中級）────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000018',
  '00000000-0000-0000-0000-000000000001',
  'RAG（Retrieval-Augmented Generation）がハルシネーションを低減できる主な理由はどれか？',
  2, 'ai_basics'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('28000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000018', '回答生成時に外部の正確な情報を根拠として注入し、その情報に基づいて回答させるため',    true,  1),
  ('28000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000018', 'モデルのパラメータ数を増やして記憶できる情報量を拡大するため',                       false, 2),
  ('28000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000018', '不適切なトークンをフィルタリングして出力から除去するため',                           false, 3),
  ('28000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000018', '最新データで定期的に再学習を自動実行してモデルの知識を更新するため',                  false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000018',
  'RAGは質問に関連する文書をベクトル検索で取得しプロンプトのコンテキストとして注入する手法。LLMが「パラメータの記憶」ではなく「提供された根拠」に基づいて回答するため、ハルシネーションを大幅に低減できる。医療・法律・社内知識などのドメインで特に効果的。根拠文書を引用させることで回答の検証も容易になる。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q19: ハルシネーション検出手法（ai_basics / 中級）──────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000019',
  '00000000-0000-0000-0000-000000000001',
  'LLMの出力にハルシネーションが含まれているかを検出する手法として、適切でないものはどれか？',
  2, 'ai_basics'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('29000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000019', '出力文字数が多いほどハルシネーションが少ないと判断する',                                         true,  1),
  ('29000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000019', 'Self-Consistency：同じ質問を複数回実行し、回答の一貫性を確認する',                               false, 2),
  ('29000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000019', 'Grounding Check：外部のナレッジベースと照合して事実確認を行う',                                  false, 3),
  ('29000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000019', 'Citation Prompting：回答の根拠となる情報源の引用を要求する',                                      false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000019',
  '文字数と信頼性に相関関係はなく「出力が長い＝ハルシネーションが少ない」は誤り。適切な検出手法としては①Self-Consistency（複数出力の多数決）②Grounding Check（ファクトチェック）③Citation Prompting（根拠引用要求）などがある。むしろ長い出力は創作部分が増えるリスクがある。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q20: LLMのConfidenceとハルシネーション（ai_basics / 上級）─
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'LLMがハルシネーションを「高い確信度で」出力することがある理由として最も適切なものはどれか？',
  3, 'ai_basics'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'LLMは確率的にトークンを生成するため、訓練データになくても流暢な文章を生成でき、誤情報を断定的に出力することがある', true,  1),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000020', '知らない情報に対してLLMは必ず「分かりません」と回答するよう設計されている',                               false, 2),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000020', 'プロンプトが長いほど正確な回答が保証される仕組みになっている',                                         false, 3),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000020', 'APIのレート制限が発生したときにのみハルシネーションが起きる',                                         false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000020',
  'LLMは「次のトークンとして尤もらしいもの」を生成するモデルであり、内部的な「自信度」と事実の正確性は必ずしも一致しない。存在しない論文・法律・人物を流暢かつ断定的に記述するケースが多く報告されており、これがハルシネーションの本質的な危険性とされる。ユーザーがLLMの断定的な口調を信頼してしまうリスクがあるため、重要な情報は必ず一次情報で確認することが推奨される。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q21: システムプロンプトによるハルシネーション対策（ai_basics / 中級）──
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000001',
  'システムプロンプトでハルシネーションを低減するために最も効果的な指示はどれか？',
  2, 'ai_basics'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('31000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', '「知らない場合は分かりませんと答え、根拠となる情報のみを使って回答しなさい」と指示する', true,  1),
  ('31000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000021', '「できるだけ詳しく、具体的な数字や固有名詞を交えて回答しなさい」と指示する',           false, 2),
  ('31000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000021', 'プロンプトを英語で書くことで正確性が自動的に向上する',                               false, 3),
  ('31000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000021', 'temperatureパラメータを最大値（2.0）に設定して多様な出力を促す',                      false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000021',
  '「不知の場合は分からないと言う」「根拠情報のみを使う」「確信がないことは明示する」などの指示をシステムプロンプトに含めることでハルシネーションを低減できる。逆に「詳しく」「具体的に」などの指示は、情報がない場合にLLMが創作で補完するリスクを高める。temperatureを高くすると出力の多様性は増すが正確性は下がる傾向がある。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q22: スラッシュコマンド（Skills）の活用（engineering / 初級）──
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000022',
  '00000000-0000-0000-0000-000000000001',
  'Claude Codeの「スラッシュコマンド（/commit、/gh-pr など）」を活用する主なメリットはどれか？',
  1, 'engineering'
)
ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, difficulty = EXCLUDED.difficulty;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('32000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'モデルのAPIコストが自動で割引される',                                                          false, 1),
  ('32000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000022', 'よく使う操作やプロンプトをコマンド化して再利用でき、作業を標準化・効率化できる',             true,  2),
  ('32000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000022', 'コンテキストウィンドウが自動的に拡張される',                                                  false, 3),
  ('32000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000022', '並列エージェントが必ず起動される',                                                             false, 4)
ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, is_correct = EXCLUDED.is_correct;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000022',
  'スラッシュコマンド（Skills）はよく使う指示・手順をコマンドとして定義する機能。/commitでコミット、/gh-prでPR作成など、複雑な手順をワンコマンドで実行できる。.claude/skills/配下にSKILL.mdを置くことでプロジェクト独自のコマンドを追加可能。チーム全員が同じ操作手順を共有でき、品質の均一化にも貢献する。'
) ON CONFLICT (question_id) DO UPDATE SET text = EXCLUDED.text;


-- ── Q23: コンテキストを汚さない手法（engineering / 中級）──────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000023',
  '00000000-0000-0000-0000-000000000001',
  'Claude Codeで長い作業セッション中にコンテキストウィンドウを効率的に使うための手法として最も適切なものはどれか？',
  2, 'engineering'
)
ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, difficulty = EXCLUDED.difficulty;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('33000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000023', 'すべての会話を1つのセッションで続け、履歴を蓄積し続ける',                                      false, 1),
  ('33000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000023', 'Agentツールでサブエージェントを起動し、独立したタスクをメインコンテキストから分離して委譲する', true,  2),
  ('33000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000023', 'プロンプトをできるだけ短くし、詳細な指示を省略する',                                             false, 3),
  ('33000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000023', '画像・スクリーンショットの添付を増やして言語情報を減らす',                                       false, 4)
ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, is_correct = EXCLUDED.is_correct;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000023',
  'Agentツールでサブエージェントを起動すると、そのエージェントは独立したコンテキストで動作するためメインセッションのトークンを消費しない。広範なコード調査・並列実装・大量のファイル読み込みはサブエージェントに委譲するのが効率的。また/clearコマンドや新しいセッションの開始、CLAUDE.mdへの繰り返し指示の事前記述も有効なコンテキスト管理手法。'
) ON CONFLICT (question_id) DO UPDATE SET text = EXCLUDED.text;


-- ── Q24: トークン使用量の最適化（engineering / 中級）────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000024',
  '00000000-0000-0000-0000-000000000001',
  'LLM APIのトークンコストを削減する上で効果が薄い（むしろ逆効果になりうる）手法はどれか？',
  2, 'engineering'
)
ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, difficulty = EXCLUDED.difficulty;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('34000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000024', '不要な会話履歴をクリアして新しいセッションを始める',                                                   false, 1),
  ('34000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000024', '「とにかく全部やって」と曖昧に指示し、モデルに判断をすべて委ねる',                                    true,  2),
  ('34000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000024', '頻繁に参照するコンテキストをCLAUDE.mdに整備し、都度説明を省く',                                        false, 3),
  ('34000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000024', '大きなファイルを全文読み込まず、必要な行範囲のみ指定して読む',                                          false, 4)
ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, is_correct = EXCLUDED.is_correct;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000024',
  '曖昧な指示はモデルが不必要な調査・確認・説明を行い、トークンを無駄に消費する原因になる。「どのファイルを・どう変更する」と具体的に伝えるのが最も効果的なコスト削減。CLAUDE.mdへの事前整備（繰り返し説明の削減）、行範囲指定読み込み（Read offset/limit）、/clearによる履歴リセットはすべて有効な最適化手法。'
) ON CONFLICT (question_id) DO UPDATE SET text = EXCLUDED.text;


-- ── Q25: MCPサーバーの役割（engineering / 中級）────────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000025',
  '00000000-0000-0000-0000-000000000001',
  'Claude CodeにMCP（Model Context Protocol）サーバーを追加する主な目的はどれか？',
  2, 'engineering'
)
ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, difficulty = EXCLUDED.difficulty;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('35000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000025', 'Claudeのモデルサイズを増加させて推論精度を向上させる',                                                  false, 1),
  ('35000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000025', 'ブラウザ操作・DB接続・外部API連携など、標準ツールにない機能をClaudeに拡張追加する',                  true,  2),
  ('35000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000025', 'チームメンバーとのリアルタイムコラボレーション機能を有効にする',                                        false, 3),
  ('35000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000025', 'コードの型チェックとLintを自動実行するCIパイプラインを構築する',                                        false, 4)
ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, is_correct = EXCLUDED.is_correct;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000025',
  'MCPはAnthropicが策定したオープンプロトコルで、外部ツール・データソースとのインターフェースを標準化する。Claude Codeでは.mcp.jsonにサーバーを定義することで、Playwright（ブラウザ自動化）・Notion・Slack・PostgreSQL接続など多様な機能を追加できる。本プロジェクトでもPlaywright MCPを使ってUIのスクリーンショット撮影・導線チェック・VRT（Visual Regression Test）を実施している。'
) ON CONFLICT (question_id) DO UPDATE SET text = EXCLUDED.text;


-- ── Q26: ChatGPTのサービス提供元（ai_services / 初級）──────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000026',
  '00000000-0000-0000-0000-000000000001',
  '「ChatGPT」を開発・提供しているサービス提供元として正しいのはどれか？',
  1, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('36000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000026', 'Google（Alphabet）', false, 1),
  ('36000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000026', 'OpenAI',            true,  2),
  ('36000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000026', 'Microsoft',         false, 3),
  ('36000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000026', 'Meta',              false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000026',
  'ChatGPTはOpenAIが2022年11月に公開したAIチャットサービス。GPT-3.5をベースに登場し、2023年にGPT-4対応版が追加された。MicrosoftはOpenAIへの出資者であり、BingやCopilotにGPT技術を採用しているが、ChatGPT自体の提供元はOpenAI。無料版（GPT-4o mini）と有料版（ChatGPT Plus）がある。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q27: 一般ユーザー向けGoogleのAIチャットサービス（ai_services / 初級）──
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000027',
  '00000000-0000-0000-0000-000000000001',
  'Googleが一般ユーザー向けに提供している無料から使えるAIチャットサービスの名称はどれか？',
  1, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('37000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000027', 'Vertex AI', false, 1),
  ('37000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000027', 'AI Studio', false, 2),
  ('37000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000027', 'Gemini',    true,  3),
  ('37000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000027', 'Bard',      false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000027',
  'Gemini（gemini.google.com）はGoogleが提供する一般ユーザー向けAIチャットサービス。旧名称はBard（2024年2月にGeminiへ改称）。無料版と高機能なGemini Advancedがある。Vertex AIはGCP上の開発者・企業向けAIプラットフォーム、AI StudioはGemini APIを試せる開発者向けツールであり、どちらも一般ユーザーが日常的に使うサービスとは異なる。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q28: GeminiのGem機能（ai_services / 初級）──────────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000028',
  '00000000-0000-0000-0000-000000000001',
  'Google Geminiに搭載されている「Gem」機能の説明として正しいものはどれか？',
  1, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('38000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000028', 'Googleの画像生成AIモデルの別称',                                              false, 1),
  ('38000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000028', 'ユーザーが目的や用途に合わせてカスタマイズできるパーソナルAIアシスタント',    true,  2),
  ('38000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000028', 'Google CloudのAIプラットフォーム「Vertex AI」のブランド名',                  false, 3),
  ('38000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000028', 'YouTube動画をAIが自動要約する機能',                                           false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000028',
  'GemはGeminiに搭載されたカスタムAIアシスタント機能。旅行プランナー・コーディングアシスタント・料理アドバイザーなど、特定の役割やトーンを設定したGemをユーザー自身が作成・保存できる。ChatGPTのGPTs（カスタムGPT）に対応するGoogle側の機能。Gemini Advancedユーザーは独自のGemを作成でき、Googleが公式に用意したGemも利用可能。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q29: OpenClawの概要（ai_services / 初級）─────────────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000029',
  '00000000-0000-0000-0000-000000000001',
  'オープンソースの自律AIエージェント「OpenClaw」を開発したのは誰か？',
  1, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('39000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000029', 'ドイツ出身の研究者がオープンソース財団として開発',           false, 1),
  ('39000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000029', 'オーストリア出身の開発者 Peter Steinberger が個人で開発',    true,  2),
  ('39000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000029', 'Anthropicの社内チームが開発した実験的プロジェクト',          false, 3),
  ('39000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000029', 'MetaのAI研究部門が開発したオープンソースエージェント',        false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000029',
  'OpenClawはオーストリア出身の開発者 Peter Steinberger がラップトップ1台で開発したオープンソース自律AIエージェント。当初はClawdbot、次にMoltbotと名称変更を経て2026年1月にOpenClawとなった。ウイルス的な口コミで急拡大し、2026年2月にPeterがOpenAIに参画することを発表。プロジェクトはオープンソース財団へ移管され、独立したオープンプロジェクトとして継続されている。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q30: OpenClawの操作インターフェース（ai_services / 初級）────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000001',
  'OpenClawをユーザーが操作する際に使用する主なインターフェースはどれか？',
  1, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000030', '専用のデスクトップGUIアプリケーション',                                           false, 1),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000030', 'Signal・Telegram・Discord・WhatsAppなどのメッセージングサービス上のチャットボット', true,  2),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000030', 'ブラウザ拡張機能として各Webページに埋め込まれるUI',                               false, 3),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000030', 'VS CodeやCursorなどのコードエディタプラグイン',                                     false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000030',
  'OpenClawはメッセージングサービスをメインUIとして設計されており、Signal・Telegram・Discord・WhatsAppなどのチャットボットとして動作する。ローカルで実行され、Claude・GPT・DeepSeekなどの外部LLMと連携する。チャットでタスクを依頼するだけでWebブラウジング・PDF要約・カレンダー登録・メール管理などを自律的に実行でき、50以上のインテグレーションを持つ。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q31: AnthropicとPalantir・国防省の対立（ai_services / 中級）──
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000031',
  '00000000-0000-0000-0000-000000000001',
  'PalantirのAIプラットフォームを通じて米国防省にClaudeを提供していたAnthropicが、2026年に国防省との関係で問題となった主な理由はどれか？',
  2, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('41000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000031', '国防省の要求をすべて受け入れ、軍事AI利用を無制限に許可したため批判を受けた',                       false, 1),
  ('41000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000031', '大量監視と自律型兵器への利用制限を求め国防省と対立した結果、Claudeの使用が禁止された',              true,  2),
  ('41000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000031', 'Palantirとの契約を一方的に解消し、国防省への関与を完全に撤退した',                                   false, 3),
  ('41000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000031', 'OpenAIと合弁会社を設立して軍事AI開発を別法人で継続することを発表したため',                             false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000031',
  'AnthropicはPalantirを通じて米国防省の機密ネットワークにClaudeを提供していたが、大量監視と自律型兵器への利用制限を求める姿勢を示した。2026年3月、国防省（トランプ政権が「戦争省」と改称）はAnthropicの技術を公式に使用禁止とした。軍が自ら選定したAIモデルを最も機密性の高い環境で運用できなくなるという異例の事態となり、防衛テック企業のClaudeへの依存にも影響が波及した。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q32: Palantir CEO Alex Karpの学術背景（ai_services / 中級）──
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000032',
  '00000000-0000-0000-0000-000000000001',
  'Palantir Technologies CEOであるAlex Karpの学術的背景として正しいものはどれか？',
  2, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('42000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000032', 'MITでコンピュータサイエンスの博士号を取得した',                                                          false, 1),
  ('42000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000032', 'フランクフルト大学で社会理論の博士号を取得し、指導教員はフランクフルト学派の哲学者ユルゲン・ハーバーマスだった', true,  2),
  ('42000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000032', 'スタンフォード大学で経営学博士（MBA）を取得した',                                                       false, 3),
  ('42000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000032', 'オックスフォード大学で倫理学の修士号を取得した',                                                         false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000032',
  'Alex KarpはHaverford Collegeを卒業後、スタンフォード法科大学院でJ.D.を取得。さらにドイツのフランクフルト大学（ゲーテ大学）で社会理論の博士号を取得し、フランクフルト学派の代表的哲学者ユルゲン・ハーバーマスに師事した。技術・ビジネスの訓練を受けずに哲学者としてPalantirを共同創業したという異色の経歴を持ち、AIの倫理観や国家安全保障における哲学的考察を公言している。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q33: 日本での主要AI有料プランの月額料金（ai_services / 初級）──
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000033',
  '00000000-0000-0000-0000-000000000001',
  '2025年時点で、ChatGPT Plus と Claude Pro の月額料金（米ドル建て）の組み合わせとして正しいものはどれか？',
  1, 'ai_services'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('43000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000033', '両サービスとも月額$10（約1,500円）',                      false, 1),
  ('43000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000033', '両サービスとも月額$20（約3,000円）',                      true,  2),
  ('43000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000033', 'ChatGPT Plusは$30、Claude Proは$15',                   false, 3),
  ('43000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000033', '両サービスとも月額$50（約7,500円）',                      false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000033',
  'ChatGPT Plus・Claude Proはいずれも月額$20（2025年時点）で、日本では為替により概ね3,000円前後。一方Google Geminiの有料プラン（Google AI Pro）は月額2,600円（円建て）で提供されており、円安局面ではやや割安感がある。各社とも無料プランを提供しつつ、有料プランで上位モデルへのアクセスや使用量の拡張を提供する構造は共通。さらに上位の超高機能プラン（ChatGPT Pro $200/月、Claude Max $100〜200/月）も存在する。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q34: 生成AIとデータセンター需要（engineering / 中級）───────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000034',
  '00000000-0000-0000-0000-000000000001',
  '生成AIが発展するとデータセンターの需要が高まるのはなぜですか？',
  2, 'engineering'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('44000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000034', '生成AIは基本的に端末内で完結するため、サーバー側の設備投資が不要になるから',                    false, 1),
  ('44000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000034', '学習・推論に大規模なGPU計算、電力、冷却、ネットワークが必要で、計算基盤を収容する施設が増えるから',  true,  2),
  ('44000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000034', '生成AIはデータ圧縮が得意なため、ストレージ需要が急減して既存データセンターが余るから',                false, 3),
  ('44000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000034', '生成AIはインターネット接続を必要としないため、データセンターの回線設備が不要になるから',              false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000034',
  '生成AI（特に大規模言語モデル）の学習や推論はGPU/TPUなどの大規模計算資源を継続的に消費する。これに伴い、サーバーラックの増設だけでなく、電力供給能力、冷却設備、ネットワーク帯域、運用体制といった「データセンターとしての収容能力」を拡大する必要が生じるため、データセンター需要が高まる。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q35: Human-in-the-loop（HITL）の目的（ai_basics / 初級）──────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000035',
  '00000000-0000-0000-0000-000000000001',
  'Human-in-the-loop（HITL）に関する説明として最も適切なのはどれか？',
  1, 'ai_basics'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('45000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000035', 'AIが自律的に意思決定し、人は結果を一切確認しない運用',                                                   false, 1),
  ('45000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000035', 'AIの出力や判断を人が確認・修正し、品質や安全性、責任の所在を担保する運用/設計',                            true,  2),
  ('45000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000035', 'AIモデルの学習を高速化するため、学習データを人がランダムに削除していく手法',                                 false, 3),
  ('45000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000035', 'AIの精度が十分に高い場合のみ、人が最初に一度だけ要件を伝えれば以降は完全自動で運用できることを指す用語',     false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000035',
  'Human-in-the-loop（HITL）は、AIの出力や意思決定プロセスに人間が介在し、確認・修正・承認といった手続きを組み込むことで、誤りや偏り、想定外の挙動を抑えながら品質と安全性を高める考え方。特に高リスク領域では、最終判断を人が行うなどの運用設計が重要となる。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q36: Claude Code hooks によるログ取得（engineering / 中級）────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000036',
  '00000000-0000-0000-0000-000000000001',
  'Claude Code の hooks を利用してログ取得運用を行うとき、最も適切な設計はどれか？',
  2, 'engineering'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('46000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000036', 'ツール実行ログを無条件に全文保存し、環境変数やトークンなどの秘匿情報もそのまま記録する',                                      false, 1),
  ('46000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000036', 'イベントごとに時刻・対象（例: ツール名）・結果（例: exit code）を構造化して記録し、秘匿情報はマスキング/除外しつつ追跡可能性を確保する', true,  2),
  ('46000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000036', '最終的なAIの回答だけを保存し、途中のツール実行やエラーは記録しない',                                                              false, 3),
  ('46000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000036', 'ログは毎回 Git にコミットして公開リポジトリに残すのが望ましい',                                                                  false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000036',
  'hooks を使うメリットは、ツール実行やエラーなどのイベントを自動で収集し「後から追える状態」にできること。実運用では、JSON Lines などの構造化ログで時刻・対象・結果を残しつつ、トークンやパスワードなどの秘匿情報はマスキング/除外し、アクセス制御や保管期間を含めて設計するのが基本。'
) ON CONFLICT (question_id) DO NOTHING;


-- ── Q37: hooks ログ運用の注意点（engineering / 中級）────────────
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES (
  '10000000-0000-0000-0000-000000000037',
  '00000000-0000-0000-0000-000000000001',
  'Claude Code の hooks で収集したログを運用に載せる際の注意点として最も重要なのはどれか？',
  2, 'engineering'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES
  ('47000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000037', 'ログは検証に役立つので、ユーザー入力や認証情報を含めて永続的に保存する',                                    false, 1),
  ('47000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000037', 'ログは後から読み返さないため、収集したらそのまま全員が読める場所に置いてよい',                            false, 2),
  ('47000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000037', '秘匿情報の混入を前提に、マスキング/最小化・アクセス制御・保管期間（ローテーション/削除）を設ける',            true,  3),
  ('47000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000037', 'ログが増えると面倒なので、まずはログ取得を完全にやめてから運用を開始する',                                  false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO explanations (question_id, text) VALUES (
  '10000000-0000-0000-0000-000000000037',
  'hooks ログには、コマンド引数・エラーメッセージ・出力などから秘匿情報が混入し得る。したがって、(1) 収集内容の最小化とマスキング、(2) アクセス制御、(3) 保管期間（ローテーション/削除）を設けることが重要。これにより監査性と安全性の両立ができる。'
) ON CONFLICT (question_id) DO NOTHING;
