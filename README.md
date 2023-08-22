# discord-data-bot

You will need to create a config.json in the root folder with the following format:

```
{
	"discord_secrets": 
	{
		"token": "bot-token",
		"clientId": "bot-clientid",
		"guildId": "guildid",
		"testGuildId": "optional-test-guildid",
	},
	"database_secrets":
	{
		"host": "host-address",
		"user": "username",
		"password": "password"
	}
}
  ```

## Database format:

### Connections:

**id** `int(11)`

**connectionType** `varchar(50)` *either 'connect', 'disconnect', 'changed', or 'unknown'*

**clientId** `varchar(50)`

**channelId** `varchar(50)`

**date** `datetime`


### Members

**id** `varchar(50)`

**name** `varchar(50)`


### Channels

**id** `varchar(50)`

**name** `varchar(50)`

