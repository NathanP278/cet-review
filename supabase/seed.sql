-- Seed Data for UPCAT Prep

-- 1. Insert Subjects
INSERT INTO subjects (id, name, description) VALUES
('b3d87563-0941-4cf4-946d-3171120dc6e7', 'Mathematics', 'Algebra, Geometry, Trigonometry, and Statistics'),
('c4e87563-0941-4cf4-946d-3171120dc6e8', 'Science', 'Biology, Chemistry, Physics, and Earth Science'),
('d5f87563-0941-4cf4-946d-3171120dc6e9', 'Language Proficiency', 'English and Filipino Grammar, Vocabulary, and Reading Comprehension')
ON CONFLICT DO NOTHING;

-- 2. Insert Topics
INSERT INTO topics (id, subject_id, name) VALUES
('11111111-0941-4cf4-946d-3171120dc6f0', 'b3d87563-0941-4cf4-946d-3171120dc6e7', 'Algebra'),
('22222222-0941-4cf4-946d-3171120dc6f1', 'b3d87563-0941-4cf4-946d-3171120dc6e7', 'Geometry'),
('33333333-0941-4cf4-946d-3171120dc6f2', 'c4e87563-0941-4cf4-946d-3171120dc6e8', 'Biology'),
('44444444-0941-4cf4-946d-3171120dc6f3', 'c4e87563-0941-4cf4-946d-3171120dc6e8', 'Chemistry'),
('55555555-0941-4cf4-946d-3171120dc6f4', 'd5f87563-0941-4cf4-946d-3171120dc6e9', 'English Grammar')
ON CONFLICT DO NOTHING;

-- 3. Insert Questions (Mix of MCQ and Flashcard types)
INSERT INTO questions (id, topic_id, type, content, answer, explanation, choices) VALUES
-- Math: Algebra
(gen_random_uuid(), '11111111-0941-4cf4-946d-3171120dc6f0', 'mcq', 'Solve for x: 3x + 5 = 20', '5', 'Subtract 5 from both sides: 3x = 15. Divide by 3: x = 5.', '["4", "5", "6", "7"]'::jsonb),
(gen_random_uuid(), '11111111-0941-4cf4-946d-3171120dc6f0', 'flashcard', 'What is the quadratic formula?', 'x = (-b ± √(b² - 4ac)) / 2a', 'Used to find the roots of a quadratic equation ax² + bx + c = 0.', NULL),

-- Math: Geometry
(gen_random_uuid(), '22222222-0941-4cf4-946d-3171120dc6f1', 'mcq', 'What is the sum of the interior angles of a pentagon?', '540°', 'Formula: (n-2) * 180. For a pentagon (n=5): (5-2) * 180 = 3 * 180 = 540°.', '["360°", "540°", "720°", "900°"]'::jsonb),
(gen_random_uuid(), '22222222-0941-4cf4-946d-3171120dc6f1', 'flashcard', 'Formula for the area of a circle', 'πr²', 'Where r is the radius of the circle.', NULL),

-- Science: Biology
(gen_random_uuid(), '33333333-0941-4cf4-946d-3171120dc6f2', 'mcq', 'Which organelle is known as the powerhouse of the cell?', 'Mitochondria', 'Mitochondria generate most of the cell''s supply of adenosine triphosphate (ATP).', '["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"]'::jsonb),
(gen_random_uuid(), '33333333-0941-4cf4-946d-3171120dc6f2', 'flashcard', 'What is mitosis?', 'A type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus.', 'Typical of ordinary tissue growth.', NULL),

-- Science: Chemistry
(gen_random_uuid(), '44444444-0941-4cf4-946d-3171120dc6f3', 'mcq', 'What is the chemical symbol for Gold?', 'Au', 'From the Latin word "aurum".', '["Ag", "Au", "Pb", "Fe"]'::jsonb),
(gen_random_uuid(), '44444444-0941-4cf4-946d-3171120dc6f3', 'flashcard', 'What is Avogadro''s number?', '6.022 × 10²³', 'The number of constituent particles (usually atoms or molecules) that are contained in one mole of a given substance.', NULL),

-- Language: English Grammar
(gen_random_uuid(), '55555555-0941-4cf4-946d-3171120dc6f4', 'mcq', 'Identify the part of speech of the word "quickly" in the sentence: "She ran quickly."', 'Adverb', 'It modifies the verb "ran".', '["Noun", "Verb", "Adjective", "Adverb"]'::jsonb),
(gen_random_uuid(), '55555555-0941-4cf4-946d-3171120dc6f4', 'flashcard', 'What is a dangling modifier?', 'A word or phrase that modifies a word not clearly stated in the sentence.', 'Example: "Having finished the assignment, the TV was turned on." (The TV didn''t finish the assignment).', NULL);
