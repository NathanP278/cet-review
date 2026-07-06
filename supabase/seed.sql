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
('d0000000-0941-4cf4-946d-3171120dc701', 'c0000000-0941-4cf4-946d-3171120dc601', 'Linear Equations', 'Solving linear equations in one or more variables', 1),
('d0000000-0941-4cf4-946d-3171120dc702', 'c0000000-0941-4cf4-946d-3171120dc601', 'Polynomials', 'Operations and factoring of polynomials', 2),
-- Biology Topics
('d0000000-0941-4cf4-946d-3171120dc703', 'c0000000-0941-4cf4-946d-3171120dc604', 'Cell Biology', 'Structure and functions of cells', 1),
('d0000000-0941-4cf4-946d-3171120dc704', 'c0000000-0941-4cf4-946d-3171120dc604', 'Genetics', 'Heredity and variation in living organisms', 2),
-- English Grammar Topics
('d0000000-0941-4cf4-946d-3171120dc705', 'c0000000-0941-4cf4-946d-3171120dc606', 'Subject-Verb Agreement', 'Matching subjects with correct verbs', 1),
-- Abstract Reasoning Topics
('d0000000-0941-4cf4-946d-3171120dc706', 'c0000000-0941-4cf4-946d-3171120dc611', 'Figural Series', 'Predicting the next shape in a sequence', 1)
ON CONFLICT DO NOTHING;

-- 4. Insert Subtopics
INSERT INTO subtopics (id, topic_id, name, description, order_index) VALUES
-- Linear Equations Subtopics
('a0000000-0941-4cf4-946d-3171120dc801', 'd0000000-0941-4cf4-946d-3171120dc701', 'Single Variable', 'Solving for x', 1),
('a0000000-0941-4cf4-946d-3171120dc802', 'd0000000-0941-4cf4-946d-3171120dc701', 'Systems of Equations', 'Solving for x and y using substitution or elimination', 2),
-- Cell Biology Subtopics
('a0000000-0941-4cf4-946d-3171120dc803', 'd0000000-0941-4cf4-946d-3171120dc703', 'Organelles', 'Mitochondria, nucleus, ribosomes, etc.', 1),
('a0000000-0941-4cf4-946d-3171120dc804', 'd0000000-0941-4cf4-946d-3171120dc703', 'Cell Division', 'Mitosis and Meiosis', 2)
ON CONFLICT DO NOTHING;

-- 5. Insert Topic Resources (Content Platform)
INSERT INTO topic_resources (id, topic_id, subtopic_id, learning_objectives, study_notes, key_concepts, formulas, common_mistakes, videos, external_links) VALUES
(
    'b0000000-0941-4cf4-946d-3171120dc901',
    'd0000000-0941-4cf4-946d-3171120dc701', -- Linear Equations
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
    'b0000000-0941-4cf4-946d-3171120dc902',
    NULL,
    'a0000000-0941-4cf4-946d-3171120dc803', -- Organelles subtopic
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
(gen_random_uuid(), NULL, 'a0000000-0941-4cf4-946d-3171120dc801', 'mcq', 'easy', 'Solve for x: 3x + 5 = 20', '5', 'Subtract 5 from both sides: 3x = 15. Divide by 3: x = 5.', '["4", "5", "6", "7"]'::jsonb, '{"algebra","linear-equations"}'),
(gen_random_uuid(), NULL, 'a0000000-0941-4cf4-946d-3171120dc801', 'flashcard', 'easy', 'What is the goal when solving a linear equation for x?', 'To isolate x on one side of the equation.', 'You use inverse operations to get x by itself.', NULL, '{"algebra"}'),

-- Math: Systems of Equations
(gen_random_uuid(), NULL, 'a0000000-0941-4cf4-946d-3171120dc802', 'mcq', 'medium', 'Solve the system: x + y = 10 and x - y = 4. What is the value of x?', '7', 'Add the equations together: (x+y) + (x-y) = 10 + 4 => 2x = 14 => x = 7.', '["3", "6", "7", "8"]'::jsonb, '{"algebra","systems"}'),

-- Science: Organelles
(gen_random_uuid(), NULL, 'a0000000-0941-4cf4-946d-3171120dc803', 'mcq', 'easy', 'Which organelle is known as the powerhouse of the cell?', 'Mitochondria', 'Mitochondria generate most of the cell''s supply of ATP.', '["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"]'::jsonb, '{"biology","cells"}'),
(gen_random_uuid(), NULL, 'a0000000-0941-4cf4-946d-3171120dc803', 'flashcard', 'medium', 'What is the function of ribosomes?', 'Protein synthesis.', 'Ribosomes link amino acids together in the order specified by messenger RNA molecules.', NULL, '{"biology"}'),

-- English: Subject-Verb Agreement (Topic Level, no Subtopics in this seed example)
(gen_random_uuid(), 'd0000000-0941-4cf4-946d-3171120dc705', NULL, 'mcq', 'medium', 'Choose the correct verb: The group of students ___ going on a field trip.', 'is', '"Group" is a singular collective noun, so it takes the singular verb "is".', '["is", "are", "am", "were"]'::jsonb, '{"grammar","sva"}'),

-- Abstract Reasoning (Topic Level)
(gen_random_uuid(), 'd0000000-0941-4cf4-946d-3171120dc706', NULL, 'mcq', 'hard', 'If a square rotates 90 degrees clockwise in each step, what will its position be after 5 steps?', 'Rotated 90 degrees clockwise', '5 steps of 90 degrees is 450 degrees. 450 - 360 = 90 degrees, which is the same as 1 step.', '["Original position", "Rotated 90 degrees clockwise", "Rotated 180 degrees", "Rotated 270 degrees"]'::jsonb, '{"abstract","patterns"}');
-- Seed Data: M17 Question Bank Engine MVP
-- This file contains a manually curated seed of high-quality questions 
-- to populate the MVP before the generation pipeline scales to 50k.

-- Linear Equations (d0000000-0941-4cf4-946d-3171120dc701)
-- category: c0000000-0941-4cf4-946d-3171120dc601, subject: b3d87563-0941-4cf4-946d-3171120dc6e7
INSERT INTO questions (subject_id, category_id, topic_id, type, difficulty, content, answer, explanation, hint, choices, estimated_time_seconds, tags, exam_type) VALUES
('b3d87563-0941-4cf4-946d-3171120dc6e7', 'c0000000-0941-4cf4-946d-3171120dc601', 'd0000000-0941-4cf4-946d-3171120dc701', 'mcq', 'medium', 
 'If 4x - 7 = 5x + 2, what is the value of x?', 
 '-9', 
 '1) Subtract 4x from both sides: -7 = x + 2. \n2) Subtract 2 from both sides: -9 = x. \nTherefore, x = -9.', 
 'Try to get all the x terms on one side and the constant terms on the other side.',
 '["-9", "-5", "5", "9"]'::jsonb, 
 45, 
 '{"algebra", "linear-equations"}',
 '{"UPCAT", "DCAT"}'),

('b3d87563-0941-4cf4-946d-3171120dc6e7', 'c0000000-0941-4cf4-946d-3171120dc601', 'd0000000-0941-4cf4-946d-3171120dc701', 'mcq', 'hard', 
 'A car rental company charges a flat fee of ₱500 plus ₱150 per day. If a customer''s total bill was ₱2,300, how many days did they rent the car?', 
 '12', 
 '1) Let d be the number of days. \n2) The equation is: 500 + 150d = 2300. \n3) Subtract 500 from both sides: 150d = 1800. \n4) Divide by 150: d = 12.', 
 'Set up an equation in the form y = mx + b where y is the total bill.',
 '["10", "11", "12", "14"]'::jsonb, 
 90, 
 '{"algebra", "word-problems"}',
 '{"UPCAT"}'),

('b3d87563-0941-4cf4-946d-3171120dc6e7', 'c0000000-0941-4cf4-946d-3171120dc601', 'd0000000-0941-4cf4-946d-3171120dc701', 'mcq', 'challenge', 
 'If 3(2x - 4) - 2(3x - 5) = k, what is the value of k?', 
 '-2', 
 '1) Distribute the terms: 6x - 12 - 6x + 10 = k. \n2) Combine like terms: The 6x and -6x cancel out. \n3) -12 + 10 = -2. \nTherefore, k = -2.', 
 'Carefully distribute the numbers outside the parentheses, especially paying attention to the negative sign on the -2.',
 '["0", "-2", "2", "-22"]'::jsonb, 
 120, 
 '{"algebra", "linear-equations"}',
 '{"ACET"}');

-- Cell Biology (d0000000-0941-4cf4-946d-3171120dc703)
-- category: c0000000-0941-4cf4-946d-3171120dc604, subject: c4e87563-0941-4cf4-946d-3171120dc6e8
INSERT INTO questions (subject_id, category_id, topic_id, type, difficulty, content, answer, explanation, hint, choices, estimated_time_seconds, tags, exam_type) VALUES
('c4e87563-0941-4cf4-946d-3171120dc6e8', 'c0000000-0941-4cf4-946d-3171120dc604', 'd0000000-0941-4cf4-946d-3171120dc703', 'mcq', 'medium', 
 'Which cellular organelle is responsible for packaging and modifying proteins for secretion?', 
 'Golgi Apparatus', 
 'The Golgi apparatus modifies, sorts, and packages proteins and lipids for transport. The Rough ER synthesizes proteins, but the Golgi is the "shipping center".', 
 'Think of the post office of the cell.',
 '["Rough Endoplasmic Reticulum", "Mitochondria", "Golgi Apparatus", "Lysosome"]'::jsonb, 
 45, 
 '{"biology", "organelles"}',
 '{"UPCAT", "USTET"}'),

('c4e87563-0941-4cf4-946d-3171120dc6e8', 'c0000000-0941-4cf4-946d-3171120dc604', 'd0000000-0941-4cf4-946d-3171120dc703', 'mcq', 'hard', 
 'If a cell is placed in a hypertonic solution, what will likely happen to it?', 
 'It will shrink due to water loss.', 
 'A hypertonic solution has a higher solute concentration than the inside of the cell. Water will move out of the cell via osmosis to balance the concentration, causing the cell to shrink (plasmolysis in plant cells, crenation in animal cells).', 
 'Hyper = more solute outside. Where does water want to go?',
 '["It will swell and burst.", "It will shrink due to water loss.", "It will remain the same size.", "It will actively transport salt out of the cell."]'::jsonb, 
 60, 
 '{"biology", "osmosis", "cells"}',
 '{"UPCAT", "DCAT"}');

-- Subject-Verb Agreement (d0000000-0941-4cf4-946d-3171120dc705)
-- category: c0000000-0941-4cf4-946d-3171120dc606, subject: d5f87563-0941-4cf4-946d-3171120dc6e9
INSERT INTO questions (subject_id, category_id, topic_id, type, difficulty, content, answer, explanation, hint, choices, estimated_time_seconds, tags, exam_type) VALUES
('d5f87563-0941-4cf4-946d-3171120dc6e9', 'c0000000-0941-4cf4-946d-3171120dc606', 'd0000000-0941-4cf4-946d-3171120dc705', 'mcq', 'medium', 
 'Choose the correct verb: Neither the manager nor the employees _____ aware of the new policy.', 
 'were', 
 'When using "Neither/Nor", the verb must agree with the subject closest to it. "Employees" is plural, so the plural verb "were" is required. "Was" is singular.', 
 'Look at the noun immediately following "nor".',
 '["was", "were", "is", "has been"]'::jsonb, 
 30, 
 '{"english", "grammar", "subject-verb"}',
 '{"ACET", "UPCAT"}'),

('d5f87563-0941-4cf4-946d-3171120dc6e9', 'c0000000-0941-4cf4-946d-3171120dc606', 'd0000000-0941-4cf4-946d-3171120dc705', 'mcq', 'hard', 
 'Identify the sentence with correct subject-verb agreement.', 
 'The bouquet of red roses smells delightful.', 
 'The subject is "bouquet", which is singular. The prepositional phrase "of red roses" does not change the subject. Therefore, the singular verb "smells" is correct.', 
 'Identify the true subject of the sentence, ignoring prepositional phrases that come between the subject and the verb.',
 '["The bouquet of red roses smell delightful.", "The bouquet of red roses smells delightful.", "The bouquets of red rose smells delightful.", "A bouquet of red roses are delightful."]'::jsonb, 
 60, 
 '{"english", "grammar"}',
 '{"UPCAT"}');
