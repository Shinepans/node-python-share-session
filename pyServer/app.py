import redis
import re

r = redis.StrictRedis(host='localhost', port='6379')

from flask import Flask
from flask import request
from pprint import pprint

app = Flask(__name__)
app.config['DEBUG'] = True


@app.route("/")
def hello():
    pprint(request.environ['HTTP_COOKIE'])
    HTTP_COOKIE = request.environ['HTTP_COOKIE']
    Parse_Code = re.findall(r'%3A(.*)\.', HTTP_COOKIE)[0]
    redisCookieCode = 'sess:' + Parse_Code

    print(redisCookieCode)
    redisHashVal = r.get(redisCookieCode)
    print(redisHashVal)
    return "Hello W"

@app.route("/info")
def info():
    print(request)


if __name__ == '__main__':
    app.run(debug=True)