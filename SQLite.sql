--
-- SQLiteStudio v3.4.4 ���ɵ��ļ������� 4�� 18 14:18:43 2024
--
-- ���õ��ı����룺System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- ��Contacts
CREATE TABLE IF NOT EXISTS Contacts (ContactID TEXT PRIMARY KEY, UserID TEXT REFERENCES Users (UserID), Name TEXT, PositionID TEXT REFERENCES Positions (PositionID), DepartmentID TEXT REFERENCES Departments (DepartmentID), Email TEXT, Phone TEXT, Address TEXT);
INSERT INTO Contacts (ContactID, UserID, Name, PositionID, DepartmentID, Email, Phone, Address) VALUES ('001', '001', '����Ա01', '001', '003', 'xian', '123', '123');
INSERT INTO Contacts (ContactID, UserID, Name, PositionID, DepartmentID, Email, Phone, Address) VALUES ('002', '002', '����', '003', '002', 'xian', '123456', '123456');

-- ��Departments
CREATE TABLE IF NOT EXISTS Departments (DepartmentID TEXT PRIMARY KEY DEFAULT ����ID, DepartmentName TEXT DEFAULT ��������, ParentID TEXT DEFAULT �ϼ�����ID);
INSERT INTO Departments (DepartmentID, DepartmentName, ParentID) VALUES ('001', '���²���', '003');
INSERT INTO Departments (DepartmentID, DepartmentName, ParentID) VALUES ('002', '��������', '003');
INSERT INTO Departments (DepartmentID, DepartmentName, ParentID) VALUES ('003', '������', NULL);

-- ��GroupMembers
CREATE TABLE IF NOT EXISTS GroupMembers (GroupID TEXT REFERENCES Groups (GroupID) DEFAULT Ⱥ��ID NOT NULL, UserID TEXT REFERENCES Users (UserID) DEFAULT �û�ID NOT NULL, JoinTime TEXT DEFAULT ����ʱ�� NOT NULL);

-- ��Groups
CREATE TABLE IF NOT EXISTS Groups (GroupID TEXT PRIMARY KEY DEFAULT ����ȺID, GroupName TEXT DEFAULT ����Ⱥ����, CreateTime TEXT DEFAULT ����ʱ��);

-- ��Messages
CREATE TABLE IF NOT EXISTS Messages (MessageID TEXT PRIMARY KEY, FromUserID TEXT REFERENCES Users (UserID), ToUserID TEXT REFERENCES Users (UserID), GroupID TEXT, Content TEXT, Timestamp TEXT);

-- ��Permissions
CREATE TABLE IF NOT EXISTS Permissions (PermissionID TEXT PRIMARY KEY, PermissionName TEXT, Description TEXT);

-- ��Positions
CREATE TABLE IF NOT EXISTS Positions (PositionID TEXT PRIMARY KEY, PositionName TEXT, DepartmentID TEXT REFERENCES Departments (DepartmentID));
INSERT INTO Positions (PositionID, PositionName, DepartmentID) VALUES ('003', '��ͨԱ��', '002');
INSERT INTO Positions (PositionID, PositionName, DepartmentID) VALUES ('002', '���²�����', '001');
INSERT INTO Positions (PositionID, PositionName, DepartmentID) VALUES ('001', '���³�', '003');

-- ��UserPermissions
CREATE TABLE IF NOT EXISTS UserPermissions (UserID TEXT REFERENCES Users (UserID) DEFAULT �û�ID NOT NULL, PermissionID TEXT REFERENCES Departments (DepartmentID) DEFAULT Ȩ��ID NOT NULL, GrantTime TEXT);

-- ��Users
CREATE TABLE IF NOT EXISTS Users (UserID TEXT (8, 32) PRIMARY KEY UNIQUE DEFAULT �û�ID, UserName TEXT (1, 32) DEFAULT �û����� NOT NULL, Password TEXT (8, 32) DEFAULT "Aa@123456", Email TEXT (0, 256) UNIQUE NOT NULL DEFAULT �ʼ���ַ, CreateTime NUMERIC);
INSERT INTO Users (UserID, UserName, Password, Email, CreateTime) VALUES ('001', 'admin', '$2b$12$89LBDNTzRH4srb6M1NLg6.U103WHqlDwVMMXl80FfLlJKp6NYe8x6', 'xianbin@qq.com', 'Wed Mar 27 2024 14:19:29 GMT+0800 (�й���׼ʱ��)');
INSERT INTO Users (UserID, UserName, Password, Email, CreateTime) VALUES ('002', '����', '$2b$12$89LBDNTzRH4srb6M1NLg6.U103WHqlDwVMMXl80FfLlJKp6NYe8x6', 'zhansan@qq.com', 'Wed Mar 27 2024 14:19:29 GMT+0800 (�й���׼ʱ��)');
INSERT INTO Users (UserID, UserName, Password, Email, CreateTime) VALUES ('f173fdf6-36eb-4eff-9a91-2ac6de971bd0', '����', '$2b$12$/5JgwJ.vDxKDKCLsVB.Mv.JfwupgQ5H80Uyjx1VpwYS5.XsTpmnkK', 'lisi@qq.com', '2024/4/18 11:38:40');

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
