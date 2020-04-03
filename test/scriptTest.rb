require 'net/http'
require 'uri'
require 'json'

uri = URI.parse("https://chat.inheaden.io/hooks/se4xr39aa7d1pbsfq6izbjao9y")

header = {'Content-Type': 'application/json'}
user = {
   text:'IHE member is requesting to open the door',
   body: 'test body'
  }

# Create the HTTP objects
http = Net::HTTP.new(uri.host, uri.port)
request = Net::HTTP::Post.new(uri.request_uri, header)
request.body = user.to_json

puts user.to_json

# Send the request
res = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => uri.scheme == 'https') do |http|
    http.request(request)
end

case res
when Net::HTTPSuccess, Net::HTTPRedirection
  puts OK
else
  res.value
end


# curl -i -X POST -H 'Content-Type: application/json' -d '{"text": "Hello, this some text\nThis is more bot text. :thumbsup:"}' https://chat.inheaden.io/hooks/afyhamzrhf8jtcschitodxzzky
