-- SQLiteStudio v3.4.4 生成的文件，周四 4月 18 14:18:43 2024
-- 所用的文本编码：System

PRAGMA foreign_keys = off; -- 禁用外键约束，以便在创建表时避免外键冲突

-- 开始一个事务，确保所有操作要么全部成功，要么全部失败
BEGIN TRANSACTION;

-- 失效token表：存储失效的token
CREATE TABLE LoseToken (
    Token TEXT PRIMARY KEY, -- 存储失效的token
    UserID INTEGER NOT NULL, -- 引用Users表的UserID
    Expiration TIMESTAMP NOT NULL -- token的过期时间
);

-- 用户表：存储用户信息，每个用户有唯一的 UserID
CREATE TABLE IF NOT EXISTS Users (
    UserID TEXT (8, 36) PRIMARY KEY UNIQUE, -- 用户唯一标识
    UserName TEXT (1, 32) NOT NULL, -- 用户名称
    Password TEXT (8, 32) NOT NULL, -- 用户密码
    Email TEXT (0, 256) UNIQUE NOT NULL, -- 用户邮箱
    Status TEXT (1, 1) DEFAULT '1' NOT NULL, -- 用户状态
    LastLoginTime DATETIME, -- 用户最后登录时间
    CreateTime DATETIME -- 用户创建时间
);
-- 插入用户数据
INSERT INTO Users (UserID, UserName, Password, Email, Status, LastLoginTime, CreateTime) VALUES ('001', 'admin', '$2b$12$89LBDNTzRH4srb6M1NLg6.U103WHqlDwVMMXl80FfLlJKp6NYe8x6', 'xianbin@qq.com','1', 'Wed Mar 27 2024 14:19:29 GMT+0800 (中国标准时间)','Wed Mar 27 2024 14:19:29 GMT+0800 (中国标准时间)');
INSERT INTO Users (UserID, UserName, Password, Email, Status, LastLoginTime, CreateTime) VALUES ('002', '张三', '$2b$12$89LBDNTzRH4srb6M1NLg6.U103WHqlDwVMMXl80FfLlJKp6NYe8x6', 'zhansan@qq.com','1', 'Wed Mar 27 2024 14:19:29 GMT+0800 (中国标准时间)','Wed Mar 27 2024 14:19:29 GMT+0800 (中国标准时间)');

-- 角色表：存储角色信息，每个角色有唯一的 RoleID
CREATE TABLE IF NOT EXISTS Roles (
    RoleID TEXT PRIMARY KEY, -- 角色唯一标识
    RoleName TEXT NOT NULL -- 角色名称
);
-- 插入角色数据
INSERT INTO Roles (RoleID, RoleName) VALUES ('admin', '管理员');
INSERT INTO Roles (RoleID, RoleName) VALUES ('user', '普通员工');

-- 用户角色关联表：存储用户角色关系，每个用户可以有多个角色
CREATE TABLE IF NOT EXISTS UserRoles (
    UserID TEXT REFERENCES Users (UserID), -- 用户ID
    RoleID TEXT REFERENCES Roles (RoleID), -- 角色ID
    PRIMARY KEY (UserID, RoleID) -- 复合主键
);
INSERT INTO UserRoles (UserID, RoleID) VALUES ('001', 'admin');
INSERT INTO UserRoles (UserID, RoleID) VALUES ('002', 'user');

-- 权限表：存储权限信息，每个权限有唯一的 PermissionID
CREATE TABLE IF NOT EXISTS Permissions (
    PermissionID TEXT PRIMARY KEY, -- 权限唯一标识
    PermissionName TEXT NOT NULL, -- 权限名称
    Description TEXT -- 权限描述
);
INSERT INTO Permissions (PermissionID, PermissionName, Description) VALUES ('001', '系统管理', '查看用户列表权限');
INSERT INTO Permissions (PermissionID, PermissionName, Description) VALUES ('002', '菜单管理', '查看用户列表权限');
INSERT INTO Permissions (PermissionID, PermissionName, Description) VALUES ('003', '用户管理', '查看用户列表权限');
INSERT INTO Permissions (PermissionID, PermissionName, Description) VALUES ('004', '角色管理', '查看用户列表权限');

-- 角色权限关联表：存储角色权限关系，每个角色可以有多个权限
CREATE TABLE IF NOT EXISTS RolePermissions (
    RoleID TEXT REFERENCES Roles (RoleID), -- 角色ID
    PermissionID TEXT REFERENCES Permissions (PermissionID), -- 权限ID
    PRIMARY KEY (RoleID, PermissionID) -- 复合主键
);
INSERT INTO RolePermissions (RoleID, PermissionID) VALUES ('admin', '001');
INSERT INTO RolePermissions (RoleID, PermissionID) VALUES ('admin', '002');
INSERT INTO RolePermissions (RoleID, PermissionID) VALUES ('admin', '003');
INSERT INTO RolePermissions (RoleID, PermissionID) VALUES ('admin', '004');

-- 菜单表：存储菜单信息，每个菜单有唯一的 MenuID
CREATE TABLE IF NOT EXISTS Menus (
    MenuID TEXT PRIMARY KEY, -- 菜单唯一标识
    MenuName TEXT NOT NULL, -- 菜单名称
    ZhName TEXT NOT NULL, -- 中文菜单名称
    ParentID TEXT DEFAULT NULL REFERENCES Menus (MenuID), -- 父菜单ID，用于表示层级结构
    Route TEXT, -- 菜单对应的路由或链接
    Icon TEXT, -- 菜单图标
    OrderIndex INTEGER DEFAULT 0 -- 菜单排序
);
INSERT INTO Menus (MenuID, MenuName, ZhName, ParentID, Route, Icon, OrderIndex) VALUES ('001', 'SystemManager','系统管理',null, '/system/', 'icon-menu', 1);
INSERT INTO Menus (MenuID, MenuName, ZhName, ParentID, Route, Icon, OrderIndex) VALUES ('002', 'MenuManager','菜单管理', '001', '/system/Menu', 'icon-menu', 1);
INSERT INTO Menus (MenuID, MenuName, ZhName, ParentID, Route, Icon, OrderIndex) VALUES ('003', 'UserManager','用户管理', '001', '/system/Users', 'icon-menu', 1);
INSERT INTO Menus (MenuID, MenuName, ZhName, ParentID, Route, Icon, OrderIndex) VALUES ('004', 'RoleManager','角色管理', '001', '/system/Roles', 'icon-menu', 1);

-- 菜单权限关联表：存储菜单权限关系
CREATE TABLE IF NOT EXISTS MenuPermissions (
    MenuID TEXT REFERENCES Menus (MenuID), -- 菜单ID
    PermissionID TEXT REFERENCES Permissions (PermissionID), -- 权限ID
    PRIMARY KEY (MenuID, PermissionID) -- 复合主键
);
INSERT INTO MenuPermissions (MenuID, PermissionID) VALUES ('001', '001');
INSERT INTO MenuPermissions (MenuID, PermissionID) VALUES ('002', '002');
INSERT INTO MenuPermissions (MenuID, PermissionID) VALUES ('003', '003');
INSERT INTO MenuPermissions (MenuID, PermissionID) VALUES ('004', '004');

-- 部门表：存储部门信息，每个部门有唯一的 DepartmentID，支持层级结构（通过 ParentID）
CREATE TABLE IF NOT EXISTS Departments (
    DepartmentID TEXT PRIMARY KEY DEFAULT '部门ID', -- 部门唯一标识
    DepartmentName TEXT DEFAULT '部门名称', -- 部门名称
    ParentID TEXT DEFAULT '上级部门ID' -- 上级部门ID，用于表示层级结构
);
INSERT INTO Departments (DepartmentID, DepartmentName, ParentID) VALUES ('001', '人事部门', '003');
INSERT INTO Departments (DepartmentID, DepartmentName, ParentID) VALUES ('002', '开发部门', '003');
INSERT INTO Departments (DepartmentID, DepartmentName, ParentID) VALUES ('003', '管理部门', NULL);

-- 职位表：存储职位信息，每个职位有唯一的 PositionID，关联到 Departments 表
CREATE TABLE IF NOT EXISTS Positions (
    PositionID TEXT PRIMARY KEY, -- 职位唯一标识
    PositionName TEXT, -- 职位名称
    DepartmentID TEXT REFERENCES Departments (DepartmentID) -- 关联到 Departments 表的 DepartmentID
);
INSERT INTO Positions (PositionID, PositionName, DepartmentID) VALUES ('003', '普通员工', '002');
INSERT INTO Positions (PositionID, PositionName, DepartmentID) VALUES ('002', '人事部部长', '001');
INSERT INTO Positions (PositionID, PositionName, DepartmentID) VALUES ('001', 'CEO', '003');

-- 职工表：存储职工信息，每个职工有唯一的 ContactID，关联到 Users 表和 Positions 表
CREATE TABLE IF NOT EXISTS Contacts (
    ContactID TEXT PRIMARY KEY, -- 职工唯一标识
    UserID TEXT REFERENCES Users (UserID), -- 关联到 Users 表的 UserID
    Name TEXT, -- 职工姓名
    PositionID TEXT REFERENCES Positions (PositionID), -- 关联到 Positions 表的 PositionID
    DepartmentID TEXT REFERENCES Departments (DepartmentID), -- 关联到 Departments 表的 DepartmentID
    Email TEXT, -- 职工邮箱
    Phone TEXT, -- 职工电话
    Address TEXT -- 职工地址
);
INSERT INTO Contacts (ContactID, UserID, Name, PositionID, DepartmentID, Email, Phone, Address) VALUES ('001', '001', '张三', '003', '002', 'xianbin@qq.com', '12345678901', '中国');

-- 消息表：存储消息信息，每条消息有唯一的 MessageID，可以是用户之间的私聊或群组消息
CREATE TABLE IF NOT EXISTS Messages (
    MessageID TEXT PRIMARY KEY, -- 消息唯一标识
    FromUserID TEXT REFERENCES Users (UserID), -- 发送消息的用户ID
    ToUserID TEXT REFERENCES Users (UserID), -- 接收消息的用户ID
    GroupID TEXT, -- 如果是群组消息，则关联到 Groups 表的 GroupID
    Content TEXT, -- 消息内容
    Timestamp TEXT -- 消息发送时间
);

-- 群组信息表：存储群组信息，每个群组有唯一的 GroupID
CREATE TABLE IF NOT EXISTS Groups (
    GroupID TEXT PRIMARY KEY DEFAULT '聊天群ID', -- 群组唯一标识
    GroupName TEXT DEFAULT '聊天群名称', -- 群组名称
    CreateTime TEXT DEFAULT '创建时间' -- 群组创建时间
);

-- 群组成员表：存储群组成员信息，每个成员关联到一个群组和一个用户
CREATE TABLE IF NOT EXISTS GroupMembers (
    GroupID TEXT REFERENCES Groups (GroupID) DEFAULT '群组ID' NOT NULL, -- 关联到 Groups 表的 GroupID
    UserID TEXT REFERENCES Users (UserID) DEFAULT '用户ID' NOT NULL, -- 关联到 Users 表的 UserID
    JoinTime TEXT DEFAULT '加入时间' NOT NULL -- 成员加入群组的时间
);

-- 提交事务，完成所有操作
COMMIT TRANSACTION;
-- 重新启用外键约束
PRAGMA foreign_keys = on;