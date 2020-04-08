def post_service
  require "net/http"
  require "uri"
  require "json"

  #   uri = URI.parse(@bell.trigger)

  uri = URI.parse("https://chat.inheaden.io/api/v4/posts")

  header = { "Content-Type": "application/json", "Authorization": "Token 6hsw4y5pk7ym8csttnbbz9ecnh" }
  #set auth_header in db, set trigger value should be /v4/posts

  body = JSON.parse('{"channel_id": "3aybp6hz5jfz3jjmyou39rtxth", "message": "again test","username":"hub31_bell"}')

  #   header = { 'Content-Type': "application/json",
  #              'Authorization': "Token " + "6hsw4y5pk7ym8csttnbbz9ecnh" }
  #set auth_header in db, set trigger value should be /v4/posts

  #   body = JSON.parse{"channel_id": "3aybp6hz5jfz3jjmyou39rtxth", "message": "TEXT","username":"hub31_bell"}
  #   body = JSON.parse(@bell.request_body)

  # Create the HTTP objects
  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Post.new(uri.request_uri, header)
  request.body = body.to_json

  # puts user.to_json

  # curl -a -H 'authorization: Token 6hsw4y5pk7ym8csttnbbz9ecnh' -H 'Content-Type: application/json' -d '{"channel_id": "3aybp6hz5jfz3jjmyou39rtxth", "message": "TEXT","username":"hub31_bell"}' https://chat.inheaden.io/api/v4/posts

  #generate migration, add coloumun, db migrate,
  # Send the request
  res = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => uri.scheme == "https") do |http|
    http.request(request)

    render json: res.to_json

    # case res
    # when Net::HTTPSuccess, Net::HTTPRedirection
    #   puts OK
    # else
    #   res.value
    # end

  end
end

post_service
