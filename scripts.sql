-- Get number of days people have connected (pie chart)
SELECT
	COUNT(DISTINCT DATE(date)) as days,
	members.name
FROM
	connections
	INNER JOIN members ON connections.clientId = members.id
WHERE
	connections.connectionType = 'connect'
GROUP BY
	members.name;

-- Join streak
SELECT
	members.name AS memberName,
	CASE
		WHEN MAX(subquery.date) < DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 0
		ELSE COUNT(*)
	END AS streak
FROM
	(
		SELECT
			connections.clientId,
			connections.connectionType,
			connections.date,
			@curRow := @curRow + (
				(
					@prevType = 'connect'
					AND connections.connectionType = 'connect'
					AND connections.date BETWEEN @prevDate
					AND DATE_ADD(@prevDate, INTERVAL 24 HOUR)
				)
			) AS streak
		FROM
			connections,
			(
				SELECT
					@curRow := 0,
					@prevType := '',
					@prevDate := ''
			) AS vars
		ORDER BY
			connections.clientId,
			connections.date
	) AS subquery,
	members
WHERE
	members.id = subquery.clientId
GROUP BY
	members.id
ORDER BY
	streak DESC;

-- The indecisive (most times switched channel)
SELECT
	members.name,
	COUNT(connections.connectionType) as 'Changes'
FROM
	connections
	INNER JOIN members ON members.id = connections.clientId
GROUP BY
	members.name;

-- Average join time (mode) : DONE (OUTDATED)
	-- SELECT
	-- 	members.name as 'user',
	-- 	DATE_FORMAT(FROM_UNIXTIME(AVG(UNIX_TIMESTAMP(date))), '%T') AS 'average'
	-- FROM
	-- 	connections
	-- 	INNER JOIN members ON connections.clientId = members.id
	-- WHERE
	-- 	connectionType = 'connect'
	-- GROUP BY
	-- 	connections.clientId;

-- Average join time (median) : DONE (OUTDATED)

	-- SELECT 
	--   name, 
	--   TIME(FROM_UNIXTIME(median_time)) AS median_time
	-- FROM (
	--   SELECT 
	--     members.name, 
	--     connections.date,
	--     @rownum := IF(@prev_name = members.name, @rownum + 1, 1) AS row_number,
	--     @median_time := UNIX_TIMESTAMP(connections.date)
	--   FROM 
	--     ${dbName}.connections,
	--     (SELECT @rownum := 0, @prev_name := '') as init
	--   INNER JOIN ${dbName}.members ON connections.clientId = members.id
	--   ORDER BY 
	--     members.name, 
	--     connections.date
	-- ) as subq
	-- WHERE 
	--   row_number = CEIL(COUNT(*) / 2)
	-- GROUP BY 
	--   members.name;

-- Average leave time : DONE

	-- SELECT
	-- 	members.name,
	-- 	AVG(TIME(date)) AS average_time
	-- FROM
	-- 	connections
	-- 	INNER JOIN members ON connections.clientId = members.id
	-- WHERE
	-- 	connectionType = 'disconnect'
	-- GROUP BY
	-- 	connections.clientId;

-- Actual logs : DONE

	-- SELECT
	-- 	connections.connectionType as 'type',
	-- 	members.name as 'user',
	-- 	channels.name as 'channel',
	-- 	DATE(connections.date) as 'date',
	-- 	TIME(connections.date) as 'time'
	-- FROM
	-- 	connections
	-- 	INNER JOIN members ON connections.clientId = members.id
	-- 	INNER JOIN channels ON connections.channelId = channels.id
	-- ORDER BY 
	-- 	connections.date ASC
	-- LIMIT 10;

-- Commands audit log : DONE
	-- INSERT INTO ${dbName}.auditLog (command, arguments, userId, date) 
	-- 	VALUES ('${command}', '${arguments}', '${userId}', '${date}');
	
-- Average time spent in voice channel

-- Most common day logged on, plus metrics for amount of days logged on for each day of the week


-- make this inline
SELECT
	members.name AS memberName,
	CASE
		WHEN MAX(subquery.date) < DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 0
		ELSE COUNT(*)
	END AS streak
FROM
	(
		SELECT
			DISTINCT DATE(date) as distinctDate,
			connections.clientId,
			connections.connectionType,
			connections.date,
			@curRow := @curRow + (
				(
					@prevType = 'connect'
					AND connections.connectionType = 'connect'
					AND connections.date BETWEEN @prevDate
					AND DATE_ADD(@prevDate, INTERVAL 24 HOUR)
				)
			) AS streak
		FROM
			connections,
			(
				SELECT
					@curRow := 0,
					@prevType := '',
					@prevDate := ''
			) AS vars
		ORDER BY
			connections.clientId,
			connections.date
	) AS subquery,
	members
WHERE
	members.id = subquery.clientId
GROUP BY
	members.id
ORDER BY
	streak DESC;


SELECT DATE_FORMAT(auditLog.date, '%Y-%m-%d %H:%i:%s') as 'date', members.name as 'name', auditLog.command as 'command', auditLog.arguments as 'args' FROM auditLog LEFT JOIN members ON auditLog.userId = members.id ORDER BY auditLog.date DESC LIMIT 40;