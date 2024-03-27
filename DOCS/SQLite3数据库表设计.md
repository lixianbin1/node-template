# SQLite3数据库表设计文档

打算做一个企业内部使用的通讯软件的Node项目,这是数据库表设计文档;

首先介绍一下SQlite3的一些数据类型;

 - INTEGER: 用于存储整数。如果您的 UserID 是数字形式，应该使用这个类型。
 - TEXT: 用于存储文本数据。适用于 UserName、Email 和 Password（尽管密码应该以哈希形式 - 存储）。
 - BLOB: 用于存储二进制大对象，如图像或文件数据。
 - REAL: 用于存储浮点数。
 - NUMERIC: 用于存储日期和时间。

## 表的设计

**用户表 (Users)**
- UserID: 主键，用户唯一标识
- UserName: 用户名
- Password: 密码
- Email: 邮箱
- CreateTime: 创建时间

**消息表 (Messages)**
- MessageID: 主键，消息唯一标识
- FromUserID: 发送者ID
- ToUserID: 接收者ID（对于群消息，此字段可为空）
- GroupID: 群组ID（对于私人消息，此字段可为空）
- Content: 消息内容
- Timestamp: 发送时间

**群组表 (Groups)**
- GroupID: 主键，群组唯一标识
- GroupName: 群组名
- CreateTime: 创建时间

**群组成员表 (GroupMembers)**
- GroupID: 群组ID
- UserID: 用户ID
- JoinTime: 加入时间

**通讯录表 (Contacts)**
- ContactID: 主键，联系人唯一标识
- UserID: 用户ID，与用户表关联
- Name: 姓名
- Position: 职位
- Department: 部门
- Email: 邮箱
- Phone: 电话号码
- Address: 地址

**部门表 (Departments)**
- DepartmentID: 主键，部门唯一标识
- DepartmentName: 部门名称
- ParentID: 上级部门ID，用于建立部门层级

**职位表 (Positions)**
- PositionID: 主键，职位唯一标识
- PositionName: 职位名称
- DepartmentID: 部门ID，与部门表关联

**权限表 (Permissions)**
- PermissionID: 主键，权限唯一标识
- PermissionName: 权限名称
- Description: 权限描述

**用户权限表 (UserPermissions)**
- UserID: 用户ID，与用户表关联
- PermissionID: 权限ID，与权限表关联
- GrantTime: 授权时间