-- MSU Campus & East Lansing Locations Seed Data
-- Run this in Supabase SQL Editor to populate all locations

-- Clear existing locations first to avoid duplicates
DELETE FROM locations;

-- ============================================
-- DORMS / RESIDENCE HALLS
-- ============================================
INSERT INTO locations (name, location_type, address, latitude, longitude) VALUES
-- South Neighborhood
('Akers Hall', 'dorm', '932 Akers Rd, East Lansing, MI', 42.7234, -84.4680),
('Holmes Hall', 'dorm', '501 E. Holmes Rd, East Lansing, MI', 42.7221, -84.4699),
('Hubbard Hall', 'dorm', '660 Red Cedar Rd, East Lansing, MI', 42.7241, -84.4724),
('McDonel Hall', 'dorm', '817 E. Shaw Ln, East Lansing, MI', 42.7248, -84.4701),
('Shaw Hall South', 'dorm', '591 Shaw Ln, East Lansing, MI', 42.7258, -84.4708),

-- East Neighborhood
('Rather Hall', 'dorm', '554 E Circle Dr, East Lansing, MI', 42.7292, -84.4700),
('Case Hall', 'dorm', '842 Chestnut Rd, East Lansing, MI', 42.7305, -84.4707),
('Wilson Hall', 'dorm', '323 N Harrison Rd, East Lansing, MI', 42.7318, -84.4715),
('Holden Hall', 'dorm', '239 N Harrison Rd, East Lansing, MI', 42.7325, -84.4720),
('Owen Hall', 'dorm', '446 W Circle Dr, East Lansing, MI', 42.7300, -84.4755),

-- Brody Neighborhood
('Brody Hall', 'dorm', '241 W Brody Rd, East Lansing, MI', 42.7263, -84.4873),
('Emmons Hall', 'dorm', '205 W Brody Rd, East Lansing, MI', 42.7255, -84.4860),
('Bailey Hall', 'dorm', '434 Farm Ln, East Lansing, MI', 42.7275, -84.4855),
('Armstrong Hall', 'dorm', '500 Farm Ln, East Lansing, MI', 42.7280, -84.4845),
('Bryan Hall', 'dorm', '450 Farm Ln, East Lansing, MI', 42.7272, -84.4840),
('Butterfield Hall', 'dorm', '870 N Shaw Ln, East Lansing, MI', 42.7268, -84.4882),

-- River Trail Neighborhood
('East Wilson Hall', 'dorm', '500 Wilson Rd, East Lansing, MI', 42.7338, -84.4693),
('West Wilson Hall', 'dorm', '520 Wilson Rd, East Lansing, MI', 42.7338, -84.4708),

-- North Neighborhood
('Mason Hall', 'dorm', '790 N Shaw Ln, East Lansing, MI', 42.7325, -84.4855),
('Abbot Hall', 'dorm', '926 N Shaw Ln, East Lansing, MI', 42.7335, -84.4865),
('Campbell Hall', 'dorm', '556 E Circle Dr, East Lansing, MI', 42.7340, -84.4710),
('Gilchrist Hall', 'dorm', '538 E Circle Dr, East Lansing, MI', 42.7345, -84.4715),
('Landon Hall', 'dorm', '338 W Circle Dr, East Lansing, MI', 42.7350, -84.4760),
('Mayo Hall', 'dorm', '530 Cherry Ln, East Lansing, MI', 42.7355, -84.4750),
('Snyder Hall', 'dorm', '362 Bogue St, East Lansing, MI', 42.7360, -84.4755),
('Phillips Hall', 'dorm', '480 Bogue St, East Lansing, MI', 42.7365, -84.4745),
('Williams Hall', 'dorm', '566 E. Circle Dr, East Lansing, MI', 42.7355, -84.4705),
('Yakeley Hall', 'dorm', '546 E. Circle Dr, East Lansing, MI', 42.7358, -84.4700),

-- University Apartments
('1855 Place', 'dorm', '1855 Place, East Lansing, MI', 42.7175, -84.4815),
('University Village', 'dorm', '1500 University Village Dr, East Lansing, MI', 42.7128, -84.4920),
('Spartan Village', 'dorm', '1460 Spartan Village, East Lansing, MI', 42.7120, -84.4880);

-- ============================================
-- DINING HALLS & FOOD
-- ============================================
INSERT INTO locations (name, location_type, address, latitude, longitude) VALUES
-- Dining Halls
('The Gallery at Snyder Phillips', 'dining', 'Snyder Phillips Hall, East Lansing, MI', 42.7362, -84.4752),
('Brody Square', 'dining', 'Brody Complex, East Lansing, MI', 42.7265, -84.4865),
('The Vista at Shaw', 'dining', 'Shaw Hall, East Lansing, MI', 42.7256, -84.4712),
('Landon Dining Hall', 'dining', '338 W Circle Dr, East Lansing, MI', 42.7350, -84.4760),
('Holden Dining Hall', 'dining', '239 N Harrison Rd, East Lansing, MI', 42.7325, -84.4720),
('Owen Dining Hall', 'dining', '446 W Circle Dr, East Lansing, MI', 42.7300, -84.4755),
('Holmes Dining Hall', 'dining', '501 E. Holmes Rd, East Lansing, MI', 42.7221, -84.4699),
('Akers Dining Hall', 'dining', 'Akers Hall, East Lansing, MI', 42.7234, -84.4680),
('Case Dining Hall', 'dining', 'Case Hall, East Lansing, MI', 42.7305, -84.4707),
('Wilson Dining Hall', 'dining', 'Wilson Hall, East Lansing, MI', 42.7338, -84.4700),

-- Campus Restaurants & Cafes
('Spartys at Wells Hall', 'dining', 'Wells Hall, East Lansing, MI', 42.7312, -84.4822),
('Spartys at Berkey Hall', 'dining', 'Berkey Hall, East Lansing, MI', 42.7298, -84.4825),
('Spartys at Shaw Hall', 'dining', 'Shaw Hall, East Lansing, MI', 42.7255, -84.4710),
('Spartys at Natural Science', 'dining', 'Natural Science Building, East Lansing, MI', 42.7296, -84.4758),
('Spartys at the Library', 'dining', 'Main Library, East Lansing, MI', 42.7310, -84.4820),
('Spartys at Bessey Hall', 'dining', 'Bessey Hall, East Lansing, MI', 42.7278, -84.4778),
('Spartys at Engineering', 'dining', 'Engineering Building, East Lansing, MI', 42.7245, -84.4780),
('Spartys at the Union', 'dining', 'MSU Union, East Lansing, MI', 42.7342, -84.4820),
('Riverwalk Market at Owen', 'dining', 'Owen Hall, East Lansing, MI', 42.7300, -84.4755),
('The Rock Cafe', 'dining', 'Wonders Hall, East Lansing, MI', 42.7198, -84.4905),
('Serranos', 'dining', 'MSU Union, East Lansing, MI', 42.7342, -84.4822),
('Eat at State', 'dining', 'International Center, East Lansing, MI', 42.7318, -84.4855),

-- Grand River Avenue Restaurants
('Pancheros', 'dining', '213 E Grand River Ave, East Lansing, MI', 42.7355, -84.4833),
('Noodles and Company', 'dining', '205 E Grand River Ave, East Lansing, MI', 42.7355, -84.4840),
('Chipotle', 'dining', '539 E Grand River Ave, East Lansing, MI', 42.7353, -84.4792),
('Qdoba', 'dining', '313 E Grand River Ave, East Lansing, MI', 42.7355, -84.4822),
('Jimmy Johns', 'dining', '127 E Grand River Ave, East Lansing, MI', 42.7357, -84.4855),
('Potbelly', 'dining', '223 E Grand River Ave, East Lansing, MI', 42.7355, -84.4828),
('Five Guys', 'dining', '551 E Grand River Ave, East Lansing, MI', 42.7353, -84.4788),
('Mennas Joint', 'dining', '115 Albert Ave, East Lansing, MI', 42.7348, -84.4858),
('Georgios Gourmet Pizzeria', 'dining', '1127 E Grand River Ave, East Lansing, MI', 42.7343, -84.4720),
('Conrads Grill', 'dining', '101 E Grand River Ave, East Lansing, MI', 42.7357, -84.4862),
('HopCat', 'dining', '300 Grove St, East Lansing, MI', 42.7348, -84.4795),
('Dublin Square', 'dining', '327 Abbott Rd, East Lansing, MI', 42.7340, -84.4802),
('Crunchys', 'dining', '254 W Grand River Ave, East Lansing, MI', 42.7360, -84.4875),
('Peanut Barrel', 'dining', '521 E Grand River Ave, East Lansing, MI', 42.7353, -84.4795),
('El Azteco', 'dining', '225 Ann St, East Lansing, MI', 42.7350, -84.4815),
('Saddleback BBQ', 'dining', '1147 S Washington Ave, Lansing, MI', 42.7230, -84.5530),
('Tacos El Cunado', 'dining', '501 E Grand River Ave, East Lansing, MI', 42.7353, -84.4798),
('Woodys Oasis', 'dining', '211 E Grand River Ave, East Lansing, MI', 42.7355, -84.4835),
('Lou and Harrys', 'dining', '211 E Grand River Ave, East Lansing, MI', 42.7355, -84.4836),
('Panera Bread', 'dining', '2771 E Grand River Ave, East Lansing, MI', 42.7420, -84.4428),
('Biggby Coffee Grand River', 'dining', '270 W Grand River Ave, East Lansing, MI', 42.7360, -84.4878),
('Espresso Royale', 'dining', '527 E Grand River Ave, East Lansing, MI', 42.7353, -84.4793),
('Starbucks Grand River', 'dining', '225 E Grand River Ave, East Lansing, MI', 42.7355, -84.4827),
('Starbucks Trowbridge', 'dining', '2990 Trowbridge Rd, East Lansing, MI', 42.7378, -84.4398),
('McDonalds Grand River', 'dining', '1024 E Grand River Ave, East Lansing, MI', 42.7345, -84.4732),
('Taco Bell Grand River', 'dining', '1042 Trowbridge Rd, East Lansing, MI', 42.7380, -84.4655),
('Wendys Grand River', 'dining', '2758 E Grand River Ave, East Lansing, MI', 42.7418, -84.4432),
('Culvers', 'dining', '2825 E Grand River Ave, East Lansing, MI', 42.7425, -84.4415),
('Insomnia Cookies', 'dining', '547 E Grand River Ave, East Lansing, MI', 42.7353, -84.4790),
('Pizza House', 'dining', '4790 S Hagadorn Rd, East Lansing, MI', 42.7050, -84.4723),
('Bells Pizza', 'dining', '1135 E Grand River Ave, East Lansing, MI', 42.7343, -84.4718);

-- ============================================
-- LIBRARIES
-- ============================================
INSERT INTO locations (name, location_type, address, latitude, longitude) VALUES
('Main Library', 'library', '366 W Circle Dr, East Lansing, MI', 42.7310, -84.4820),
('Gast Business Library', 'library', 'Eppley Center, East Lansing, MI', 42.7275, -84.4825),
('Engineering Library', 'library', 'Engineering Building, East Lansing, MI', 42.7245, -84.4785),
('Law Library', 'library', 'Law College Building, East Lansing, MI', 42.7230, -84.4758),
('Math Library', 'library', 'Wells Hall, East Lansing, MI', 42.7312, -84.4822),
('STEM Library', 'library', 'STEM Teaching and Learning Facility, East Lansing, MI', 42.7232, -84.4770),
('Digital Scholarship Lab', 'library', 'Main Library, East Lansing, MI', 42.7310, -84.4820),
('Map Library', 'library', 'Main Library, East Lansing, MI', 42.7310, -84.4818),
('Special Collections', 'library', 'Main Library, East Lansing, MI', 42.7310, -84.4822);

-- ============================================
-- GYMS & RECREATION
-- ============================================
INSERT INTO locations (name, location_type, address, latitude, longitude) VALUES
('IM Sports West', 'gym', '939 Birch Rd, East Lansing, MI', 42.7328, -84.4922),
('IM Sports East', 'gym', '308 W Circle Dr, East Lansing, MI', 42.7295, -84.4770),
('IM Sports Circle', 'gym', 'Circle Dr, East Lansing, MI', 42.7305, -84.4755),
('Jenison Field House', 'gym', '220 Trowbridge Rd, East Lansing, MI', 42.7332, -84.4888),
('Munn Ice Arena', 'gym', '509 Birch Rd, East Lansing, MI', 42.7315, -84.4902),
('Spartan Stadium', 'gym', '325 W Shaw Ln, East Lansing, MI', 42.7284, -84.4922),
('Breslin Center', 'gym', '534 Birch Rd, East Lansing, MI', 42.7308, -84.4905),
('MSU Pavilion', 'gym', '4301 Farm Ln, East Lansing, MI', 42.7095, -84.4835),
('Tennis Center', 'gym', '3569 Mount Hope Rd, East Lansing, MI', 42.7115, -84.4722),
('Skandalaris Football Center', 'gym', '400 Red Cedar Rd, East Lansing, MI', 42.7278, -84.4935),
('Demmer Family Golf Center', 'gym', '3555 Forest Rd, Lansing, MI', 42.7025, -84.4665),
('Forest Akers Golf Course West', 'gym', '3535 Forest Rd, Lansing, MI', 42.7035, -84.4690),
('Forest Akers Golf Course East', 'gym', '2161 Service Rd, Lansing, MI', 42.7102, -84.4615),
('MSU Aquatic Center', 'gym', 'IM Sports Circle, East Lansing, MI', 42.7305, -84.4755),
('Powerhouse Gym East Lansing', 'gym', '2650 E Grand River Ave, East Lansing, MI', 42.7412, -84.4460);

-- ============================================
-- ACADEMIC BUILDINGS
-- ============================================
INSERT INTO locations (name, location_type, address, latitude, longitude) VALUES
-- Main Campus Academic Buildings
('Wells Hall', 'building', 'Wells Hall, East Lansing, MI', 42.7312, -84.4822),
('Berkey Hall', 'building', 'Berkey Hall, East Lansing, MI', 42.7298, -84.4825),
('Bessey Hall', 'building', 'Bessey Hall, East Lansing, MI', 42.7278, -84.4778),
('Natural Science Building', 'building', 'Natural Science, East Lansing, MI', 42.7296, -84.4758),
('Chemistry Building', 'building', 'Chemistry Building, East Lansing, MI', 42.7278, -84.4748),
('Biochemistry Building', 'building', 'Biochemistry, East Lansing, MI', 42.7268, -84.4738),
('Kedzie Hall', 'building', 'Kedzie Hall, East Lansing, MI', 42.7325, -84.4798),
('Morrill Hall', 'building', 'Morrill Hall, East Lansing, MI', 42.7315, -84.4788),
('Ernst Bessey Hall', 'building', 'Ernst Bessey Hall, East Lansing, MI', 42.7290, -84.4775),
('Giltner Hall', 'building', 'Giltner Hall, East Lansing, MI', 42.7272, -84.4755),

-- Engineering Complex
('Engineering Building', 'building', 'Engineering Building, East Lansing, MI', 42.7245, -84.4780),
('Engineering Research Complex', 'building', '1449 Engineering Research Ct, East Lansing, MI', 42.7218, -84.4750),
('FRIB', 'building', '640 S Shaw Ln, East Lansing, MI', 42.7225, -84.4732),
('Biomedical Physical Sciences', 'building', '567 Wilson Rd, East Lansing, MI', 42.7235, -84.4698),
('Plant Biology Building', 'building', 'Plant Biology, East Lansing, MI', 42.7248, -84.4668),
('Cyclotron Building', 'building', 'Cyclotron, East Lansing, MI', 42.7238, -84.4718),

-- Business & Economics
('Eppley Center', 'building', 'Eppley Center, East Lansing, MI', 42.7275, -84.4825),
('Eli Broad College of Business', 'building', 'N Business Complex, East Lansing, MI', 42.7285, -84.4835),
('Henry Center', 'building', '3535 Forest Rd, Lansing, MI', 42.7028, -84.4672),

-- Communications & Arts
('Communication Arts Sciences', 'building', 'CAS Building, East Lansing, MI', 42.7262, -84.4815),
('Auditorium', 'building', 'Auditorium, East Lansing, MI', 42.7292, -84.4852),
('Fairchild Theatre', 'building', 'Auditorium, East Lansing, MI', 42.7290, -84.4855),
('Wharton Center', 'building', '750 E Shaw Ln, East Lansing, MI', 42.7268, -84.4685),
('MSU Museum', 'building', '409 W Circle Dr, East Lansing, MI', 42.7315, -84.4858),
('Kresge Art Center', 'building', '600 Auditorium Rd, East Lansing, MI', 42.7282, -84.4850),
('Broad Art Museum', 'building', '547 E Circle Dr, East Lansing, MI', 42.7318, -84.4718),

-- Law & Social Sciences
('Law College Building', 'building', 'Law College, East Lansing, MI', 42.7230, -84.4758),
('International Center', 'building', 'International Center, East Lansing, MI', 42.7318, -84.4855),
('Baker Hall', 'building', 'Baker Hall, East Lansing, MI', 42.7302, -84.4855),
('South Kedzie Hall', 'building', 'South Kedzie, East Lansing, MI', 42.7318, -84.4792),

-- Health Sciences
('Clinical Center', 'building', 'Clinical Center, East Lansing, MI', 42.7222, -84.4825),
('Life Science Building', 'building', 'Life Science, East Lansing, MI', 42.7248, -84.4728),
('Food Science Human Nutrition', 'building', 'Food Science, East Lansing, MI', 42.7228, -84.4803),
('College of Nursing', 'building', 'Bott Building, East Lansing, MI', 42.7215, -84.4798),
('Taubman Medical Research', 'building', '550 Farm Ln, East Lansing, MI', 42.7262, -84.4858),

-- Education & Human Development
('Erickson Hall', 'building', 'Erickson Hall, East Lansing, MI', 42.7282, -84.4795),

-- Agriculture & Natural Resources
('Agriculture Hall', 'building', 'Agriculture Hall, East Lansing, MI', 42.7265, -84.4825),
('Anthony Hall', 'building', 'Anthony Hall, East Lansing, MI', 42.7255, -84.4838),
('Packaging Building', 'building', 'Packaging Building, East Lansing, MI', 42.7242, -84.4852),
('Trout Food Science Building', 'building', 'Trout Building, East Lansing, MI', 42.7232, -84.4808),
('Chittenden Hall', 'building', 'Chittenden Hall, East Lansing, MI', 42.7248, -84.4812),

-- Computer Science & IT
('Computer Center', 'building', 'Computer Center, East Lansing, MI', 42.7308, -84.4802),
('STEM Teaching Learning Facility', 'building', '642 Red Cedar Rd, East Lansing, MI', 42.7232, -84.4770),

-- Other Academic
('Music Building', 'building', 'Music Building, East Lansing, MI', 42.7305, -84.4868),
('Human Ecology Building', 'building', 'Human Ecology, East Lansing, MI', 42.7280, -84.4810),
('Olds Hall', 'building', 'Olds Hall, East Lansing, MI', 42.7325, -84.4835),
('Linton Hall', 'building', 'Linton Hall, East Lansing, MI', 42.7330, -84.4845),
('Cowles House', 'building', 'Cowles House, East Lansing, MI', 42.7315, -84.4845),
('Beaumont Tower', 'building', 'Beaumont Tower, East Lansing, MI', 42.7320, -84.4838),
('Student Services Building', 'building', '556 E Circle Dr, East Lansing, MI', 42.7338, -84.4712),
('Hannah Administration Building', 'building', 'Hannah Admin, East Lansing, MI', 42.7330, -84.4858),
('Nisbet Building', 'building', 'Nisbet Building, East Lansing, MI', 42.7295, -84.4862),
('Conrad Hall', 'building', 'Conrad Hall, East Lansing, MI', 42.7292, -84.4808),
('Olin Health Center', 'building', '463 E Circle Dr, East Lansing, MI', 42.7318, -84.4732),
('MSU Union', 'building', '49 Abbot Rd, East Lansing, MI', 42.7342, -84.4820),
('Spartan Statue', 'building', 'Demonstration Hall, East Lansing, MI', 42.7312, -84.4852);

-- ============================================
-- OTHER CAMPUS LOCATIONS
-- ============================================
INSERT INTO locations (name, location_type, address, latitude, longitude) VALUES
-- Parking & Transportation
('Grand River Parking Ramp', 'other', 'Grand River Parking Ramp, East Lansing, MI', 42.7352, -84.4788),
('Shaw Ramp', 'other', 'Shaw Parking Ramp, East Lansing, MI', 42.7262, -84.4698),
('Wharton Center Parking Ramp', 'other', 'Wharton Parking, East Lansing, MI', 42.7268, -84.4672),

-- Student Services
('MSU Bookstore', 'other', 'International Center, East Lansing, MI', 42.7318, -84.4858),
('MSU Federal Credit Union', 'other', '3777 West Rd, East Lansing, MI', 42.7310, -84.4925),
('Spartan Ticket Office', 'other', 'Jenison Field House, East Lansing, MI', 42.7332, -84.4888),
('MSU Police', 'other', '1120 Red Cedar Rd, East Lansing, MI', 42.7158, -84.4632),
('Career Services Network', 'other', '113 Student Services, East Lansing, MI', 42.7338, -84.4712),
('Counseling Psychiatric Services', 'other', 'Olin Health Center, East Lansing, MI', 42.7318, -84.4732),

-- Religious Centers
('St John Student Parish', 'other', '327 MAC Ave, East Lansing, MI', 42.7335, -84.4805),
('University United Methodist', 'other', '1120 S Harrison Rd, East Lansing, MI', 42.7255, -84.4722),
('MSU Hillel', 'other', '360 Charles St, East Lansing, MI', 42.7348, -84.4798),

-- Shopping
('The Market at 1855 Place', 'other', '1855 Place, East Lansing, MI', 42.7175, -84.4815),
('Meijer East Lansing', 'other', '2055 W Grand River Ave, Okemos, MI', 42.7392, -84.4312),
('Target East Lansing', 'other', '2900 Coolidge Rd, East Lansing, MI', 42.7385, -84.4205),

-- Outdoor Spaces
('Red Cedar River', 'other', 'Red Cedar River, East Lansing, MI', 42.7295, -84.4725),
('Beal Botanical Garden', 'other', 'Beal Botanical Garden, East Lansing, MI', 42.7288, -84.4748),
('MSU Horticulture Gardens', 'other', '1066 Bogue St, East Lansing, MI', 42.7372, -84.4728),
('The Rock', 'other', 'Farm Lane and Shaw Lane, East Lansing, MI', 42.7265, -84.4852),
('Sanford Natural Area', 'other', 'Sanford Natural Area, East Lansing, MI', 42.7060, -84.4775),

-- Medical Facilities
('MSU Health Care', 'other', '788 Service Rd, East Lansing, MI', 42.7188, -84.4658),
('Sparrow Hospital', 'other', '1215 E Michigan Ave, Lansing, MI', 42.7330, -84.5428),
('McLaren Greater Lansing', 'other', '401 W Greenlawn Ave, Lansing, MI', 42.7505, -84.5620),

-- Entertainment Venues
('The Loft', 'other', '414 E Michigan Ave, Lansing, MI', 42.7328, -84.5478),
('Celebration Cinema Lansing', 'other', '200 E Edgewood Blvd, Lansing, MI', 42.6915, -84.5458),

-- Banks & Services
('Chase Bank Grand River', 'other', '101 E Grand River Ave, East Lansing, MI', 42.7357, -84.4860),

-- East Lansing Landmarks
('East Lansing City Hall', 'other', '410 Abbot Rd, East Lansing, MI', 42.7358, -84.4805),
('Hannah Community Center', 'other', '819 Abbot Rd, East Lansing, MI', 42.7388, -84.4815),
('East Lansing Public Library', 'other', '950 Abbot Rd, East Lansing, MI', 42.7395, -84.4818);

-- Verify the count
SELECT location_type, COUNT(*) as count
FROM locations
GROUP BY location_type
ORDER BY count DESC;
