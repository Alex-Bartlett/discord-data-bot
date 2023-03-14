# discord-data-bot

If you need to run locally, create a config.json in the root directory in the following format:

```
{
    "token": "bot-token",
    "clientId": "bot-clientid",
    "guildId": "guildid",
    "testGuildId": "optional-test-guildid",
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

