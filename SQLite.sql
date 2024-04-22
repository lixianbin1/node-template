--
-- SQLiteStudio v3.4.4 生成的文件，周四 4月 18 14:18:43 2024
--
-- 所用的文本编码：System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- 表：Contacts
CREATE TABLE IF NOT EXISTS Contacts (ContactID TEXT PRIMARY KEY, UserID TEXT REFERENCES Users (UserID), Name TEXT, PositionID TEXT REFERENCES Positions (PositionID), DepartmentID TEXT REFERENCES Departments (DepartmentID), Email TEXT, Phone TEXT, Address TEXT);
INSERT INTO Contacts (ContactID, UserID, Name, PositionID, DepartmentID, Email, Phone, Address) VALUES ('001', '001', '管理员01', '001', '003', 'xian', '123', '123');
INSERT INTO Contacts (ContactID, UserID, Name, PositionID, DepartmentID, Email, Phone, Address) VALUES ('002', '002', '张三', '003', '002', 'xian', '123456', '123456');

-- 表：Departments
CREATE TABLE IF NOT EXISTS Departments (DepartmentID TEXT PRIMARY KEY DEFAULT 部门ID, DepartmentName TEXT DEFAULT 部门名称, ParentID TEXT DEFAULT 上级部门ID);
INSERT INTO Departments (DepartmentID, DepartmentName, ParentID) VALUES ('001', '人事部门', '003');
INSERT INTO Departments (DepartmentID, DepartmentName, ParentID) VALUES ('002', '开发部门', '003');
INSERT INTO Departments (DepartmentID, DepartmentName, ParentID) VALUES ('003', '管理部门', NULL);

-- 表：GroupMembers
CREATE TABLE IF NOT EXISTS GroupMembers (GroupID TEXT REFERENCES Groups (GroupID) DEFAULT 群组ID NOT NULL, UserID TEXT REFERENCES Users (UserID) DEFAULT 用户ID NOT NULL, JoinTime TEXT DEFAULT 加入时间 NOT NULL);

-- 表：Groups
CREATE TABLE IF NOT EXISTS Groups (GroupID TEXT PRIMARY KEY DEFAULT 聊天群ID, GroupName TEXT DEFAULT 聊天群名称, CreateTime TEXT DEFAULT 创建时间);

-- 表：Messages
CREATE TABLE IF NOT EXISTS Messages (MessageID TEXT PRIMARY KEY, FromUserID TEXT REFERENCES Users (UserID), ToUserID TEXT REFERENCES Users (UserID), GroupID TEXT, Content TEXT, Timestamp TEXT);

-- 表：Permissions
CREATE TABLE IF NOT EXISTS Permissions (PermissionID TEXT PRIMARY KEY, PermissionName TEXT, Description TEXT);

-- 表：Positions
CREATE TABLE IF NOT EXISTS Positions (PositionID TEXT PRIMARY KEY, PositionName TEXT, DepartmentID TEXT REFERENCES Departments (DepartmentID));
INSERT INTO Positions (PositionID, PositionName, DepartmentID) VALUES ('003', '普通员工', '002');
INSERT INTO Positions (PositionID, PositionName, DepartmentID) VALUES ('002', '人事部部长', '001');
INSERT INTO Positions (PositionID, PositionName, DepartmentID) VALUES ('001', '董事长', '003');

-- 表：UserPermissions
CREATE TABLE IF NOT EXISTS UserPermissions (UserID TEXT REFERENCES Users (UserID) DEFAULT 用户ID NOT NULL, PermissionID TEXT REFERENCES Departments (DepartmentID) DEFAULT 权限ID NOT NULL, GrantTime TEXT);

-- 表：Users
CREATE TABLE IF NOT EXISTS Users (UserID TEXT (8, 32) PRIMARY KEY UNIQUE DEFAULT 用户ID, UserName TEXT (1, 32) DEFAULT 用户名称 NOT NULL, Password TEXT (8, 32) DEFAULT "Aa@123456", Email TEXT (0, 256) UNIQUE NOT NULL DEFAULT 邮件地址, CreateTime NUMERIC);
INSERT INTO Users (UserID, UserName, Password, Email, CreateTime) VALUES ('001', 'admin', '$2b$12$89LBDNTzRH4srb6M1NLg6.U103WHqlDwVMMXl80FfLlJKp6NYe8x6', 'xianbin@qq.com', 'Wed Mar 27 2024 14:19:29 GMT+0800 (中国标准时间)');
INSERT INTO Users (UserID, UserName, Password, Email, CreateTime) VALUES ('002', '张三', '$2b$12$89LBDNTzRH4srb6M1NLg6.U103WHqlDwVMMXl80FfLlJKp6NYe8x6', 'zhansan@qq.com', 'Wed Mar 27 2024 14:19:29 GMT+0800 (中国标准时间)');
INSERT INTO Users (UserID, UserName, Password, Email, CreateTime) VALUES ('f173fdf6-36eb-4eff-9a91-2ac6de971bd0', '李四', '$2b$12$/5JgwJ.vDxKDKCLsVB.Mv.JfwupgQ5H80Uyjx1VpwYS5.XsTpmnkK', 'lisi@qq.com', '2024/4/18 11:38:40');

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
