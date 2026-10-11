-- ============================================================
--  BIIT STUDENT MINI PORTAL — DATABASE (SQL Server)
--  Yeh script NAYE computer par poora database bana deta hai.
--  Isme department (AI / SE / CS) aur comments ki table bhi shamil hain.
--  Agar aap ka database pehle se bana hua hai to isay dobara na chalayein.
-- ============================================================

CREATE DATABASE BIIT_Portal;
GO
USE BIIT_Portal;
GO

-- ============================================================
-- TABLE 1: USERS — login karne wale sab log (student aur admin)
-- Use hoti hai: LoginScreen
-- ============================================================
CREATE TABLE USERS (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    name       NVARCHAR(100) NOT NULL,
    email      NVARCHAR(100) NOT NULL UNIQUE,
    password   NVARCHAR(255) NOT NULL,
    role       NVARCHAR(10)  NOT NULL CHECK (role IN ('student', 'admin')),
    created_at DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- TABLE 2: STUDENTS — student ki extra detail (USERS se jura hua)
-- Use hoti hai: StudentProfile, StudentEditProfile, StudentDirectory
-- department: AI / SE / CS (notice targeting ke liye)
-- ============================================================
CREATE TABLE STUDENTS (
    id                INT IDENTITY(1,1) PRIMARY KEY,
    user_id           INT          NOT NULL UNIQUE,
    arid_number       NVARCHAR(30) NOT NULL UNIQUE,
    phone             NVARCHAR(20) NULL,
    program           NVARCHAR(10) NOT NULL CHECK (program IN ('BSCS', 'BSSE', 'ALUMNI')),
    semester          NVARCHAR(10) NOT NULL,             -- jaise BSCS-7B (app isme se number nikalti hai)
    department        NVARCHAR(10) NULL CHECK (department IN ('AI', 'SE', 'CS')),
    status            NVARCHAR(10) NOT NULL CHECK (status IN ('current', 'alumni')),
    is_email_verified BIT          NOT NULL DEFAULT 0,
    is_phone_verified BIT          NOT NULL DEFAULT 0,

    CONSTRAINT FK_Students_Users FOREIGN KEY (user_id) REFERENCES USERS(id)
);
GO

-- ============================================================
-- TABLE 3: ADMINS — admin ki extra detail (USERS se jura hua)
-- Use hoti hai: AdminDashboard, AdminProfile
-- ============================================================
CREATE TABLE ADMINS (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    user_id    INT          NOT NULL UNIQUE,
    admin_code NVARCHAR(20) NOT NULL,

    CONSTRAINT FK_Admins_Users FOREIGN KEY (user_id) REFERENCES USERS(id)
);
GO

-- ============================================================
-- TABLE 4: NOTICES — notice board ke notices
-- Use hoti hai: StudentDashboard, StudentNoticeBoard, AdminNoticeBoard, AdminPostNotice
-- department / semester_from / semester_to khali (NULL) hon to notice SAB ko dikhta hai
-- ============================================================
CREATE TABLE NOTICES (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    posted_by     INT           NOT NULL,              -- notice likhne wale ka user_id
    title         NVARCHAR(150) NOT NULL,
    category      NVARCHAR(50)  NOT NULL,              -- Academic / Facility / Event / Update
    description   NVARCHAR(MAX) NULL,
    image_url     NVARCHAR(255) NULL,
    department    NVARCHAR(10)  NULL CHECK (department IN ('AI', 'SE', 'CS')),
    semester_from NVARCHAR(10)  NULL,                  -- jaise 1st
    semester_to   NVARCHAR(10)  NULL,                  -- jaise 8th
    status        NVARCHAR(10)  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at    DATETIME      NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Notices_Users FOREIGN KEY (posted_by) REFERENCES USERS(id)
);
GO

-- ============================================================
-- TABLE 5: NOTICE_REQUESTS — students ki bheji hui requests
-- Use hoti hai: PostRequest (student), AdminApprovals (admin)
-- status: pending -> approved / rejected
-- ============================================================
CREATE TABLE NOTICE_REQUESTS (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    student_id    INT           NOT NULL,
    title         NVARCHAR(150) NOT NULL,
    category      NVARCHAR(50)  NOT NULL,
    description   NVARCHAR(MAX) NULL,
    image_url     NVARCHAR(255) NULL,
    department    NVARCHAR(10)  NULL CHECK (department IN ('AI', 'SE', 'CS')),
    semester_from NVARCHAR(10)  NULL,
    semester_to   NVARCHAR(10)  NULL,
    status        NVARCHAR(10)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at    DATETIME      NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_NoticeRequests_Students FOREIGN KEY (student_id) REFERENCES STUDENTS(id)
);
GO

-- ============================================================
-- TABLE 6: NOTICE_COMMENTS — notice par comments
-- Use hoti hai: StudentNoticeBoard, AdminNoticeBoard (notice popup, abhi hide hai)
-- Notice delete hone par uske comments khud delete ho jate hain (CASCADE)
-- ============================================================
CREATE TABLE NOTICE_COMMENTS (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    notice_id    INT            NOT NULL,
    user_id      INT            NOT NULL,
    comment_text NVARCHAR(1000) NOT NULL,
    created_at   DATETIME       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Comments_Notice FOREIGN KEY (notice_id) REFERENCES NOTICES(id) ON DELETE CASCADE,
    CONSTRAINT FK_Comments_User   FOREIGN KEY (user_id)   REFERENCES USERS(id)
);
GO

-- ============================================================
-- SAMPLE DATA (test ke liye)
-- ============================================================

-- Admin
INSERT INTO USERS (name, email, password, role) VALUES ('Muhammad Ali', 'MuhammadAli@biit.edu', 'admin123', 'admin');
INSERT INTO ADMINS (user_id, admin_code) VALUES (1, 'BIIT123');

-- Students (sab ka password: pass123)
INSERT INTO USERS (name, email, password, role) VALUES ('Ahmed Ali',      'Ahmed.Ali@biit.edu',   'pass123', 'student');
INSERT INTO USERS (name, email, password, role) VALUES ('Hamza Ahmed',    'Hamza.Ahmed@biit.edu', 'pass123', 'student');
INSERT INTO USERS (name, email, password, role) VALUES ('Sara Khan',      'Sara.Khan@biit.edu',   'pass123', 'student');
INSERT INTO USERS (name, email, password, role) VALUES ('Bilal Siddiqui', 'Bilal.S@biit.edu',     'pass123', 'student');
INSERT INTO USERS (name, email, password, role) VALUES ('Ayesha Malik',   'Ayesha.M@biit.edu',    'pass123', 'student');

-- Student profiles (semester ke saath department bhi: CS ya SE)
INSERT INTO STUDENTS (user_id, arid_number, phone, program, semester, department, status, is_email_verified, is_phone_verified)
VALUES (2, '2023-ARID-0323', '+92 300 1234567', 'BSCS', 'BSCS-7B', 'CS', 'current', 1, 1);
INSERT INTO STUDENTS (user_id, arid_number, phone, program, semester, department, status, is_email_verified, is_phone_verified)
VALUES (3, '21-ARID-1234',   '+92 301 0000001', 'BSCS', 'BSCS-6A', 'CS', 'current', 0, 0);
INSERT INTO STUDENTS (user_id, arid_number, phone, program, semester, department, status, is_email_verified, is_phone_verified)
VALUES (4, '20-ARID-5678',   '+92 302 0000002', 'BSSE', 'BSSE-8B', 'SE', 'current', 1, 0);
INSERT INTO STUDENTS (user_id, arid_number, phone, program, semester, department, status, is_email_verified, is_phone_verified)
VALUES (5, '22-ARID-0912',   '+92 303 0000003', 'BSCS', 'BSCS-4B', 'CS', 'current', 0, 0);
INSERT INTO STUDENTS (user_id, arid_number, phone, program, semester, department, status, is_email_verified, is_phone_verified)
VALUES (6, '19-ARID-4421',   '+92 304 0000004', 'BSSE', 'BSSE-8A', 'SE', 'alumni',  1, 1);

-- Notices (department khali = sab departments ko dikhte hain)
INSERT INTO NOTICES (posted_by, title, category, description, semester_from, semester_to)
VALUES (1, 'Fall Registration Open',  'Academic', 'New semester registration is now open for all students.', '1st', '8th');
INSERT INTO NOTICES (posted_by, title, category, description, semester_from, semester_to)
VALUES (1, 'Library Maintenance',     'Facility', 'Main library wing will be closed this weekend.',          '1st', '8th');
INSERT INTO NOTICES (posted_by, title, category, description, semester_from, semester_to)
VALUES (1, 'Annual Sports Gala 2024', 'Event',    'Opening ceremony at the main ground. Register now.',      '1st', '8th');
INSERT INTO NOTICES (posted_by, title, category, description, semester_from, semester_to)
VALUES (1, 'Internship Update',       'Update',   'Quality Assurance internship opportunity at JDA.',        '5th', '8th');

-- Targeting dikhane ke liye 2 notices: ek sirf SE ke liye, ek sirf CS ke liye
INSERT INTO NOTICES (posted_by, title, category, description, department, semester_from, semester_to)
VALUES (1, 'SE Project Meeting', 'Academic', 'Meeting for all Software Engineering final year students.', 'SE', '7th', '8th');
INSERT INTO NOTICES (posted_by, title, category, description, department, semester_from, semester_to)
VALUES (1, 'CS Lab Timing',      'Facility', 'New lab timings for Computer Science students.',            'CS', '1st', '8th');

-- Notice requests (students ki bheji hui, pending)
INSERT INTO NOTICE_REQUESTS (student_id, title, category, description, semester_from, semester_to)
VALUES (1, 'Annual Sports Meet 2024',    'Event',    'Inter-department sports meet scheduled next month.', '1st', '8th');
INSERT INTO NOTICE_REQUESTS (student_id, title, category, description, semester_from, semester_to)
VALUES (3, 'Digital Marketing Workshop', 'Academic', 'Session with industry experts for final year students.', '6th', '8th');
GO

-- Aakhir me check: har table me kitni rows hain
SELECT 'USERS'           AS [Table], COUNT(*) AS [Rows] FROM USERS            UNION ALL
SELECT 'STUDENTS',         COUNT(*) FROM STUDENTS                              UNION ALL
SELECT 'ADMINS',           COUNT(*) FROM ADMINS                                UNION ALL
SELECT 'NOTICES',          COUNT(*) FROM NOTICES                               UNION ALL
SELECT 'NOTICE_REQUESTS',  COUNT(*) FROM NOTICE_REQUESTS                       UNION ALL
SELECT 'NOTICE_COMMENTS',  COUNT(*) FROM NOTICE_COMMENTS;
GO
