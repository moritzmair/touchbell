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

  def ringring
    if @bell.request_type == "POST"
      require 'net/http'
      require 'uri'
      require 'json'

      uri = URI.parse(@bell.trigger)

      header = {'Content-Type': 'application/json'}

      body = JSON.parse(@bell.request_body)

      # Create the HTTP objects
      http = Net::HTTP.new(uri.host, uri.port)
      request = Net::HTTP::Post.new(uri.request_uri, header)
      request.body = body.to_json

      # puts user.to_json

      # Send the request
      res = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => uri.scheme == 'https') do |http|
          http.request(request)
      end

      render json: res.to_json

      # case res
      # when Net::HTTPSuccess, Net::HTTPRedirection
      #   puts OK
      # else
      #   res.value
      # end
    else
      uri = URI(@bell.trigger)
      response = Net::HTTP.get(uri)
      render json: response.to_json
    end    
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_bell
    @bell = Bell.find(params[:id])
  end

  # Only allow a trusted parameter "white list" through.
  def bell_params
    params.require(:bell).permit(:name, :trigger, :admin_hash, :logo, :background, :enabled, :request_body, :request_type)
  end
end
