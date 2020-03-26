# frozen_string_literal: true

class BellsController < ApplicationController
  before_action :set_bell, only: %i[show edit update destroy ringring]
  before_action :authenticate_user!, except: :ringring

  def index
    @bells = Bell.all
  end

  def show
    unless current_user == @bell.user || current_user.admin?
      redirect_to(bells_url, alert: 'You can not view details for this bell') && return
    end
    unless params[:enabled].nil?
      @bell.enabled = params[:enabled]
      @bell.save
      redirect_to(bells_url, notice: 'bell was enabled or disabled')
    end
  end

  def new
    @bell = Bell.new
  end

  def edit; end

  def create
    unless current_user.bells.count.zero? || current_user.admin?
      redirect_to(bells_url, alert: 'You can only create one bell') && return
    end

    @bell = Bell.new(bell_params)
    @bell.user = current_user

    if @bell.save
      redirect_to @bell, notice: 'Bell was successfully created.'
    else
      render :new
    end
  end

  def update
    unless current_user == @bell.user || current_user.admin?
      redirect_to(bells_url, alert: 'You can not edit this bell') && return
    end
    if @bell.update(bell_params)
      redirect_to @bell, notice: 'Bell was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    unless current_user == @bell.user || current_user.admin?
      redirect_to(bells_url, alert: 'You can not delete this bell') && return
    end
    @bell.destroy
    redirect_to bells_url, notice: 'Bell was successfully destroyed.'
  end

  # GET request
  def ringring_get
    require 'net/http'
    uri = URI(@bell.trigger)
    
    response = Net::HTTP.get(uri)

    # redirect_to bells_url, notice: 'Klingel wurde ausgelöst: ' + response
    render json: response.to_json
  end

  #POST request
  def ringring_post
    require 'net/http'
    require 'uri'
    require 'json'

   # uri = URI.parse("http://localhost:3000/users")
    uri = URI(@bell.trigger)

    header = {'Content-Type': 'text/json'}
    user = {
      user: {
          title:'DING DONG', message: 'IHE member is ringing'
      }
    }

    # Create the HTTP objects
    http = Net::HTTP.new(uri.host, uri.port)
    request = Net::HTTP::Post.new(uri.request_uri, header)
    request.body = user.to_json

    # Send the request
    response = http.request(request)
  end 

  #  -- post req example ---
  # require 'uri'
  # require 'json'
  # require 'net/http'
  
  # jsonbody = '{
  #              "id":50071,"name":"qatest123456","pricings":[
  #               {"id":"dsb","name":"DSB","entity_type":"Other","price":6},
  #               {"id":"tokens","name":"Tokens","entity_type":"All","price":500}
  #               ]
  #             }'
  
  # # Prepare request
  # url = server + "/v1/entities"
  # uri = URI.parse(url)  
  # http = Net::HTTP.new(uri.host, uri.port)
  # http.set_debug_output( $stdout )
  
  # request = Net::HTTP::Put.new(uri )
  # request.body = jsonbody
  # request.set_content_type("application/json")
  
  # # Send request
  # response = http.request(request)


  private

  # Use callbacks to share common setup or constraints between actions.
  def set_bell
    @bell = Bell.find(params[:id])
  end

  # Only allow a trusted parameter "white list" through.
  def bell_params
    params.require(:bell).permit(:name, :trigger, :admin_hash, :logo, :background, :enabled)
  end
end
