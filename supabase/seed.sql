-- Seed Data for CET Prep M15 Content Foundation

-- 1. Insert Subjects
INSERT INTO subjects (id, name, description, icon) VALUES
('b3d87563-0941-4cf4-946d-3171120dc6e7', 'Mathematics', 'Algebra, Geometry, Trigonometry, Calculus, and Statistics', 'Calculator'),
('c4e87563-0941-4cf4-946d-3171120dc6e8', 'Science', 'Biology, Chemistry, Physics, and Earth Science', 'FlaskConical'),
('d5f87563-0941-4cf4-946d-3171120dc6e9', 'English Grammar & Vocabulary', 'Grammar rules, sentence structure, and vocabulary', 'BookOpen'),
('e6187563-0941-4cf4-946d-3171120dc6ea', 'Reading Comprehension', 'Analyzing texts, inference, and context clues', 'FileText'),
('f7287563-0941-4cf4-946d-3171120dc6eb', 'Filipino Grammar & Vocabulary', 'Balarila, Talasalitaan, at Wastong Gamit', 'MessageSquare'),
('a1287563-0941-4cf4-946d-3171120dc6ec', 'General Knowledge', 'Philippine History, Constitution, and Current Events', 'Globe'),
('b2387563-0941-4cf4-946d-3171120dc6ed', 'Abstract Reasoning', 'Pattern Recognition, Spatial Ability, and Logic', 'Puzzle')
ON CONFLICT DO NOTHING;

-- 2. Insert Categories
INSERT INTO categories (id, subject_id, name, description, order_index) VALUES
-- Math
('c0000000-0941-4cf4-946d-3171120dc601', 'b3d87563-0941-4cf4-946d-3171120dc6e7', 'Algebra', 'Equations, inequalities, and functions', 1),
('c0000000-0941-4cf4-946d-3171120dc602', 'b3d87563-0941-4cf4-946d-3171120dc6e7', 'Geometry', 'Shapes, areas, and volumes', 2),
('c0000000-0941-4cf4-946d-3171120dc603', 'b3d87563-0941-4cf4-946d-3171120dc6e7', 'Trigonometry', 'Angles and triangles', 3),
-- Science
('c0000000-0941-4cf4-946d-3171120dc604', 'c4e87563-0941-4cf4-946d-3171120dc6e8', 'Biology', 'Study of living organisms', 1),
('c0000000-0941-4cf4-946d-3171120dc605', 'c4e87563-0941-4cf4-946d-3171120dc6e8', 'Chemistry', 'Matter and its properties', 2),
-- English
('c0000000-0941-4cf4-946d-3171120dc606', 'd5f87563-0941-4cf4-946d-3171120dc6e9', 'Grammar Rules', 'Structural rules of English', 1),
('c0000000-0941-4cf4-946d-3171120dc607', 'd5f87563-0941-4cf4-946d-3171120dc6e9', 'Vocabulary', 'Word meanings and usage', 2),
-- Filipino
('c0000000-0941-4cf4-946d-3171120dc608', 'f7287563-0941-4cf4-946d-3171120dc6eb', 'Balarila', 'Wastong gamit ng mga salita', 1),
-- Reading Comp
('c0000000-0941-4cf4-946d-3171120dc609', 'e6187563-0941-4cf4-946d-3171120dc6ea', 'Informational Texts', 'Articles, essays, and journals', 1),
-- General Knowledge
('c0000000-0941-4cf4-946d-3171120dc610', 'a1287563-0941-4cf4-946d-3171120dc6ec', 'Philippine History', 'Key events in Philippine history', 1),
-- Abstract Reasoning
('c0000000-0941-4cf4-946d-3171120dc611', 'b2387563-0941-4cf4-946d-3171120dc6ed', 'Pattern Recognition', 'Visual sequences and series', 1)
ON CONFLICT DO NOTHING;

-- 3. Insert Topics
INSERT INTO topics (id, category_id, name, description, order_index) VALUES
-- Algebra Topics
('t0000000-0941-4cf4-946d-3171120dc701', 'c0000000-0941-4cf4-946d-3171120dc601', 'Linear Equations', 'Solving linear equations in one or more variables', 1),
('t0000000-0941-4cf4-946d-3171120dc702', 'c0000000-0941-4cf4-946d-3171120dc601', 'Polynomials', 'Operations and factoring of polynomials', 2),
-- Biology Topics
('t0000000-0941-4cf4-946d-3171120dc703', 'c0000000-0941-4cf4-946d-3171120dc604', 'Cell Biology', 'Structure and functions of cells', 1),
('t0000000-0941-4cf4-946d-3171120dc704', 'c0000000-0941-4cf4-946d-3171120dc604', 'Genetics', 'Heredity and variation in living organisms', 2),
-- English Grammar Topics
('t0000000-0941-4cf4-946d-3171120dc705', 'c0000000-0941-4cf4-946d-3171120dc606', 'Subject-Verb Agreement', 'Matching subjects with correct verbs', 1),
-- Abstract Reasoning Topics
('t0000000-0941-4cf4-946d-3171120dc706', 'c0000000-0941-4cf4-946d-3171120dc611', 'Figural Series', 'Predicting the next shape in a sequence', 1)
ON CONFLICT DO NOTHING;

-- 4. Insert Subtopics
INSERT INTO subtopics (id, topic_id, name, description, order_index) VALUES
-- Linear Equations Subtopics
('s0000000-0941-4cf4-946d-3171120dc801', 't0000000-0941-4cf4-946d-3171120dc701', 'Single Variable', 'Solving for x', 1),
('s0000000-0941-4cf4-946d-3171120dc802', 't0000000-0941-4cf4-946d-3171120dc701', 'Systems of Equations', 'Solving for x and y using substitution or elimination', 2),
-- Cell Biology Subtopics
('s0000000-0941-4cf4-946d-3171120dc803', 't0000000-0941-4cf4-946d-3171120dc703', 'Organelles', 'Mitochondria, nucleus, ribosomes, etc.', 1),
('s0000000-0941-4cf4-946d-3171120dc804', 't0000000-0941-4cf4-946d-3171120dc703', 'Cell Division', 'Mitosis and Meiosis', 2)
ON CONFLICT DO NOTHING;

-- 5. Insert Topic Resources (Content Platform)
INSERT INTO topic_resources (id, topic_id, subtopic_id, learning_objectives, study_notes, key_concepts, formulas, common_mistakes, videos, external_links) VALUES
(
    'r0000000-0941-4cf4-946d-3171120dc901',
    't0000000-0941-4cf4-946d-3171120dc701', -- Linear Equations
    NULL,
    '["Understand the concept of isolating a variable", "Solve two-step equations"]',
    'Linear equations form a straight line when graphed. The core rule is whatever you do to one side, you must do to the other.',
    '[{"term": "Variable", "definition": "A symbol representing an unknown value"}, {"term": "Coefficient", "definition": "A number multiplied by a variable"}]',
    '[{"name": "Slope-Intercept Form", "formula": "y = mx + b", "explanation": "m is slope, b is y-intercept"}]',
    '["Forgetting to distribute the negative sign", "Adding instead of subtracting across the equal sign"]',
    '[{"title": "Solving Linear Equations Basics", "url": "https://youtube.com/watch?v=example1", "duration": "10:05"}]',
    '[{"title": "Khan Academy: Linear Equations", "url": "https://khanacademy.org/math/algebra"}]'
),
(
    'r0000000-0941-4cf4-946d-3171120dc902',
    NULL,
    's0000000-0941-4cf4-946d-3171120dc803', -- Organelles subtopic
    '["Identify major cell organelles", "Understand organelle functions in plant vs animal cells"]',
    'Organelles are specialized structures that perform various jobs inside cells. The nucleus is the control center.',
    '[{"term": "Mitochondria", "definition": "Powerhouse of the cell, produces ATP"}, {"term": "Chloroplast", "definition": "Site of photosynthesis in plant cells"}]',
    '[]',
    '["Confusing cell wall (plants only) with cell membrane (all cells)"]',
    '[]',
    '[]'
)
ON CONFLICT DO NOTHING;

-- 6. Insert Questions (Mix of MCQ and Flashcard types for Subtopics & Topics)
INSERT INTO questions (id, topic_id, subtopic_id, type, difficulty, content, answer, explanation, choices, tags) VALUES
-- Math: Single Variable
(gen_random_uuid(), NULL, 's0000000-0941-4cf4-946d-3171120dc801', 'mcq', 'easy', 'Solve for x: 3x + 5 = 20', '5', 'Subtract 5 from both sides: 3x = 15. Divide by 3: x = 5.', '["4", "5", "6", "7"]'::jsonb, '{"algebra","linear-equations"}'),
(gen_random_uuid(), NULL, 's0000000-0941-4cf4-946d-3171120dc801', 'flashcard', 'easy', 'What is the goal when solving a linear equation for x?', 'To isolate x on one side of the equation.', 'You use inverse operations to get x by itself.', NULL, '{"algebra"}'),

-- Math: Systems of Equations
(gen_random_uuid(), NULL, 's0000000-0941-4cf4-946d-3171120dc802', 'mcq', 'medium', 'Solve the system: x + y = 10 and x - y = 4. What is the value of x?', '7', 'Add the equations together: (x+y) + (x-y) = 10 + 4 => 2x = 14 => x = 7.', '["3", "6", "7", "8"]'::jsonb, '{"algebra","systems"}'),

-- Science: Organelles
(gen_random_uuid(), NULL, 's0000000-0941-4cf4-946d-3171120dc803', 'mcq', 'easy', 'Which organelle is known as the powerhouse of the cell?', 'Mitochondria', 'Mitochondria generate most of the cell''s supply of ATP.', '["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"]'::jsonb, '{"biology","cells"}'),
(gen_random_uuid(), NULL, 's0000000-0941-4cf4-946d-3171120dc803', 'flashcard', 'medium', 'What is the function of ribosomes?', 'Protein synthesis.', 'Ribosomes link amino acids together in the order specified by messenger RNA molecules.', NULL, '{"biology"}'),

-- English: Subject-Verb Agreement (Topic Level, no Subtopics in this seed example)
(gen_random_uuid(), 't0000000-0941-4cf4-946d-3171120dc705', NULL, 'mcq', 'medium', 'Choose the correct verb: The group of students ___ going on a field trip.', 'is', '"Group" is a singular collective noun, so it takes the singular verb "is".', '["is", "are", "am", "were"]'::jsonb, '{"grammar","sva"}'),

-- Abstract Reasoning (Topic Level)
(gen_random_uuid(), 't0000000-0941-4cf4-946d-3171120dc706', NULL, 'mcq', 'hard', 'If a square rotates 90 degrees clockwise in each step, what will its position be after 5 steps?', 'Rotated 90 degrees clockwise', '5 steps of 90 degrees is 450 degrees. 450 - 360 = 90 degrees, which is the same as 1 step.', '["Original position", "Rotated 90 degrees clockwise", "Rotated 180 degrees", "Rotated 270 degrees"]'::jsonb, '{"abstract","patterns"}');
