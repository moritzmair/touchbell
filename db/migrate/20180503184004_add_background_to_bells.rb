# frozen_string_literal: true

class AddBackgroundToBells < ActiveRecord::Migration[5.1]
  def change
    add_column :bells, :background, :string
  end
end
