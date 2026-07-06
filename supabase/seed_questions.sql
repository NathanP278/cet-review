-- Seed Data: M17 Question Bank Engine MVP
-- This file contains a manually curated seed of high-quality questions 
-- to populate the MVP before the generation pipeline scales to 50k.

-- Linear Equations (t0000000-0941-4cf4-946d-3171120dc701)
-- category: c0000000-0941-4cf4-946d-3171120dc601, subject: b3d87563-0941-4cf4-946d-3171120dc6e7
INSERT INTO questions (subject_id, category_id, topic_id, type, difficulty, content, answer, explanation, hint, choices, estimated_time_seconds, tags, exam_type) VALUES
('b3d87563-0941-4cf4-946d-3171120dc6e7', 'c0000000-0941-4cf4-946d-3171120dc601', 't0000000-0941-4cf4-946d-3171120dc701', 'mcq', 'medium', 
 'If 4x - 7 = 5x + 2, what is the value of x?', 
 '-9', 
 '1) Subtract 4x from both sides: -7 = x + 2. \n2) Subtract 2 from both sides: -9 = x. \nTherefore, x = -9.', 
 'Try to get all the x terms on one side and the constant terms on the other side.',
 '["-9", "-5", "5", "9"]'::jsonb, 
 45, 
 '{"algebra", "linear-equations"}',
 '{"UPCAT", "DCAT"}'),

('b3d87563-0941-4cf4-946d-3171120dc6e7', 'c0000000-0941-4cf4-946d-3171120dc601', 't0000000-0941-4cf4-946d-3171120dc701', 'mcq', 'hard', 
 'A car rental company charges a flat fee of ₱500 plus ₱150 per day. If a customer''s total bill was ₱2,300, how many days did they rent the car?', 
 '12', 
 '1) Let d be the number of days. \n2) The equation is: 500 + 150d = 2300. \n3) Subtract 500 from both sides: 150d = 1800. \n4) Divide by 150: d = 12.', 
 'Set up an equation in the form y = mx + b where y is the total bill.',
 '["10", "11", "12", "14"]'::jsonb, 
 90, 
 '{"algebra", "word-problems"}',
 '{"UPCAT"}'),

('b3d87563-0941-4cf4-946d-3171120dc6e7', 'c0000000-0941-4cf4-946d-3171120dc601', 't0000000-0941-4cf4-946d-3171120dc701', 'mcq', 'challenge', 
 'If 3(2x - 4) - 2(3x - 5) = k, what is the value of k?', 
 '-2', 
 '1) Distribute the terms: 6x - 12 - 6x + 10 = k. \n2) Combine like terms: The 6x and -6x cancel out. \n3) -12 + 10 = -2. \nTherefore, k = -2.', 
 'Carefully distribute the numbers outside the parentheses, especially paying attention to the negative sign on the -2.',
 '["0", "-2", "2", "-22"]'::jsonb, 
 120, 
 '{"algebra", "linear-equations"}',
 '{"ACET"}');

-- Cell Biology (t0000000-0941-4cf4-946d-3171120dc703)
-- category: c0000000-0941-4cf4-946d-3171120dc604, subject: c4e87563-0941-4cf4-946d-3171120dc6e8
INSERT INTO questions (subject_id, category_id, topic_id, type, difficulty, content, answer, explanation, hint, choices, estimated_time_seconds, tags, exam_type) VALUES
('c4e87563-0941-4cf4-946d-3171120dc6e8', 'c0000000-0941-4cf4-946d-3171120dc604', 't0000000-0941-4cf4-946d-3171120dc703', 'mcq', 'medium', 
 'Which cellular organelle is responsible for packaging and modifying proteins for secretion?', 
 'Golgi Apparatus', 
 'The Golgi apparatus modifies, sorts, and packages proteins and lipids for transport. The Rough ER synthesizes proteins, but the Golgi is the "shipping center".', 
 'Think of the post office of the cell.',
 '["Rough Endoplasmic Reticulum", "Mitochondria", "Golgi Apparatus", "Lysosome"]'::jsonb, 
 45, 
 '{"biology", "organelles"}',
 '{"UPCAT", "USTET"}'),

('c4e87563-0941-4cf4-946d-3171120dc6e8', 'c0000000-0941-4cf4-946d-3171120dc604', 't0000000-0941-4cf4-946d-3171120dc703', 'mcq', 'hard', 
 'If a cell is placed in a hypertonic solution, what will likely happen to it?', 
 'It will shrink due to water loss.', 
 'A hypertonic solution has a higher solute concentration than the inside of the cell. Water will move out of the cell via osmosis to balance the concentration, causing the cell to shrink (plasmolysis in plant cells, crenation in animal cells).', 
 'Hyper = more solute outside. Where does water want to go?',
 '["It will swell and burst.", "It will shrink due to water loss.", "It will remain the same size.", "It will actively transport salt out of the cell."]'::jsonb, 
 60, 
 '{"biology", "osmosis", "cells"}',
 '{"UPCAT", "DCAT"}');

-- Subject-Verb Agreement (t0000000-0941-4cf4-946d-3171120dc705)
-- category: c0000000-0941-4cf4-946d-3171120dc606, subject: d5f87563-0941-4cf4-946d-3171120dc6e9
INSERT INTO questions (subject_id, category_id, topic_id, type, difficulty, content, answer, explanation, hint, choices, estimated_time_seconds, tags, exam_type) VALUES
('d5f87563-0941-4cf4-946d-3171120dc6e9', 'c0000000-0941-4cf4-946d-3171120dc606', 't0000000-0941-4cf4-946d-3171120dc705', 'mcq', 'medium', 
 'Choose the correct verb: Neither the manager nor the employees _____ aware of the new policy.', 
 'were', 
 'When using "Neither/Nor", the verb must agree with the subject closest to it. "Employees" is plural, so the plural verb "were" is required. "Was" is singular.', 
 'Look at the noun immediately following "nor".',
 '["was", "were", "is", "has been"]'::jsonb, 
 30, 
 '{"english", "grammar", "subject-verb"}',
 '{"ACET", "UPCAT"}'),

('d5f87563-0941-4cf4-946d-3171120dc6e9', 'c0000000-0941-4cf4-946d-3171120dc606', 't0000000-0941-4cf4-946d-3171120dc705', 'mcq', 'hard', 
 'Identify the sentence with correct subject-verb agreement.', 
 'The bouquet of red roses smells delightful.', 
 'The subject is "bouquet", which is singular. The prepositional phrase "of red roses" does not change the subject. Therefore, the singular verb "smells" is correct.', 
 'Identify the true subject of the sentence, ignoring prepositional phrases that come between the subject and the verb.',
 '["The bouquet of red roses smell delightful.", "The bouquet of red roses smells delightful.", "The bouquets of red rose smells delightful.", "A bouquet of red roses are delightful."]'::jsonb, 
 60, 
 '{"english", "grammar"}',
 '{"UPCAT"}');
