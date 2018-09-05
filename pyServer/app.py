import redis
import re
import json

r = redis.StrictRedis(host='localhost', port='6379')

from flask import Flask
from flask import request
from pprint import pprint

app = Flask(__name__)
app.config['DEBUG'] = True


@app.route("/py/")
def hello():
    return "Hello W"

@app.route("/py/info")
def info():
    print(request)
    pprint(request.environ['HTTP_COOKIE'])
    HTTP_COOKIE = request.environ['HTTP_COOKIE']
    Parse_Code = re.findall(r'%3A(.*)\.', HTTP_COOKIE)[0]
    redisCookieCode = 'sess:' + Parse_Code

    print(redisCookieCode)
    redisHashVal = r.get(redisCookieCode)
    print(redisHashVal)
    redisInfoJson = json.loads(redisHashVal)
    print(redisInfoJson)
    print('userID: ' + redisInfoJson['passport']['user'])
    return 'userID: ' + redisInfoJson['passport']['user']


if __name__ == '__main__':
    app.run(debug=True)