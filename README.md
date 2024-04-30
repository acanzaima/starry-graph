# starry-graph

一个Neo4j的CURD可视化项目

###### 快速使用

如果你不是程序员或者你并不关心本仓库想直接在你的电脑上（仅限于Windows平台）使用，可以扫描下面的二维码去下载，下载完成后按*说明.txt*文件启动即可

![9B9494FAD13ED334FE16BD4FFCBEACAB](public/9B9494FAD13ED334FE16BD4FFCBEACAB.png)

###### 版本信息

- Neo4j 5.8.0
- jdk 17.0.7

###### 准备

1. 下载Neo4j并解压到任意位置[path-neo4j]，[官网](https://neo4j.com/deployment-center/#community)，[微云地址](https://we-yun.com/doc/neo4j/)

2. 下载jdk免安装版解压到任意位置[path-jdk]，[官网](https://www.oracle.com/java/technologies/downloads/)

3. 配置Neo4j的jdk路径

   ```
   # 若需使用已有环境jdk请注意neo4j与jdk版本对应关系，可以参考以下对应关系
     Neo4j 版本	        支持的 JDK 版本
     Neo4j 5.0+	     JDK 17 或更高版本
     Neo4j 4.3+	     JDK 11 或更高版本
     Neo4j 4.0 - 4.2	 JDK 11 或 JDK 8（需要在安装时进行额外配置）
     Neo4j 3.5 - 3.6	 JDK 8
     Neo4j 3.0 - 3.4	 JDK 8
     Neo4j 2.x	         JDK 7 或 JDK 8
     
   # 若版本对应关系不匹配，请完成以下操作
   1). 打开[path-neo4j]/neo4j-community-5.8.0/bin/neo4j.bat
   2). 添加语句 SET "JAVA_HOME=[path-jdk]"
   请注意，本文档中出现的[path-neo4j]、[path-jdk]应当为你解压的具体路径
   ```

4. 修改neo4j密码

   ```
   1). 启动neo4j，执行命令[path-neo4j]/neo4j-community-5.8.0/bin/neo4j.bat console
   2). 窗口显示INFO  Started字样表示启动成功，打开浏览器访问默认地址 http://localhost:7474/
   3). 此时页面会提示输入用户名及密码，默认均为neo4j
   4). 输入完成后会提示修改新的密码，此时可以设置你的连接密码[password-neo4j]
   ```

5. 修改项目配置文件

   ```
   > cd starry-graph/src/config
   修改NEO4J_USER_PASSWORD为[password-neo4j]
   ```

###### 运行

```javascript
> [path-neo4j]/neo4j-community-5.8.0/bin/neo4j.bat console
> yarn
> yarn dev
```

